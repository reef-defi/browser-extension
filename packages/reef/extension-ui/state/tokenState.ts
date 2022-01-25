import {combineLatest, map, mergeScan, Observable, of, shareReplay, switchMap, timer,} from 'rxjs';
import {api, Pool, reefTokenWithAmount, rpc, Token,} from '@reef-defi/react-lib';
import {BigNumber, utils} from 'ethers';
import {ApolloClient, gql} from '@apollo/client';
import {combineTokensDistinct, toTokensWithPrice} from './util';
import {selectedSigner$} from './accountState';
import {providerSubj, selectedNetworkSubj} from './providerState';
import {apolloClientInstance$} from '../graphql/apolloConfig';
import {Observable as ZenObservable,} from 'zen-observable-ts'

// TODO replace with our own from lib and remove
const toPlainString = (num: number): string => (`${+num}`).replace(/(-?)(\d*)\.?(\d*)e([+-]\d+)/,
  (a, b, c, d, e) => (e < 0
    ? `${b}0.${Array(1 - e - c.length).join('0')}${c}${d}`
    : b + c + d + Array(e - d.length + 1).join('0')));

const validatedTokens = { tokens: [] };

export const reefPrice$ = timer(0, 60000).pipe(
  switchMap(api.retrieveReefCoingeckoPrice),
  shareReplay(1),
);

export const validatedTokens$ = of(validatedTokens.tokens as Token[]);

const SIGNER_TOKENS_GQL = gql`
  subscription query ($accountId: String!) {
            token_holder(
              order_by: { balance: desc }
              where: { signer: { _eq: $accountId } }
            ) {
              token_address
              balance
            }
          }
`;
const CONTRACT_DATA_GQL = gql`
  query query ($addresses: [String!]!) {
            verified_contract(
              where: { address: { _in: $addresses } }
            ) {
              address
              contract_data
            }
          }
`;

// eslint-disable-next-line camelcase
const fetchTokensData = (apollo: ApolloClient<any>, missingCacheContractDataAddresses: string[], state: { tokens: Token[]; contractData: Token[] }): Promise<Token[]> => apollo.query({
  query: CONTRACT_DATA_GQL,
  variables: { addresses: missingCacheContractDataAddresses },
})
// eslint-disable-next-line camelcase
  .then((verContracts: any) => verContracts.data.verified_contract.map((vContract: { address: string, contract_data: any }) => ({
    address: vContract.address,
    iconUrl: vContract.contract_data.token_icon_url,
    decimals: vContract.contract_data.decimals,
    name: vContract.contract_data.name,
    symbol: vContract.contract_data.symbol,
    balance: BigNumber.from('0')
  } as Token)))
  .then((newTokens: Token[]) => newTokens.concat(state.contractData));

// eslint-disable-next-line camelcase
const tokenBalancesWithContractDataCache = (apollo: ApolloClient<any>) => (state: { tokens: Token[], contractData: Token[] }, tokenBalances: { token_address: string, balance: number}[]) => {
  const missingCacheContractDataAddresses = tokenBalances.filter((tb) => !state.contractData.some((cd) => cd.address === tb.token_address)).map((tb) => tb.token_address);
  const contractDataPromise = missingCacheContractDataAddresses.length
    ? fetchTokensData(apollo, missingCacheContractDataAddresses, state)
    : Promise.resolve(state.contractData);

  return contractDataPromise.then((cData: Token[]) => {
    const tkns = tokenBalances.map((tBalance) => {
      const cDataTkn = cData.find((cd) => cd.address === tBalance.token_address) as Token;
      return { ...cDataTkn, balance: BigNumber.from(toPlainString(tBalance.balance)) };
    }).filter((v) => !!v);
    return { tokens: tkns, contractData: cData };
  });
};

const zenToRx = <T>(zenObservable: ZenObservable<T>): Observable<T> =>
  new Observable(
    observer => zenObservable.subscribe(observer)
  );

export const selectedSignerTokenBalancesWS$ = combineLatest([apolloClientInstance$, selectedSigner$, providerSubj]).pipe(
  switchMap(([apollo, signer, provider]) => (!signer ? []
    : zenToRx(apollo.subscribe({
        query: SIGNER_TOKENS_GQL,
        variables: {accountId: signer.address},
        fetchPolicy: 'network-only',
      })).pipe(
      map((res: any) => (res.data && res.data.token_holder ? res.data.token_holder : undefined)),
      // eslint-disable-next-line camelcase
      switchMap((tokenBalances:{token_address: string, balance: number}[]) => {
        const reefTkn = reefTokenWithAmount();
        const hasReefBalance = tokenBalances.some((tb) => tb.token_address === reefTkn.address);
        if (!hasReefBalance) {
          return rpc.getReefCoinBalance(signer.address, provider).then((reefBalance) => {
            tokenBalances.push({ token_address: reefTkn.address, balance: parseInt(utils.formatUnits(reefBalance, 'wei'), 10) });
            return tokenBalances;
          });
        }
        return Promise.resolve(tokenBalances);
      }),
      // eslint-disable-next-line camelcase
      mergeScan(tokenBalancesWithContractDataCache(apollo), { tokens: [], contractData: [reefTokenWithAmount()] }),
      map((val: {tokens: Token[]}) => val.tokens),
    )
  )),
);

export const allAvailableSignerTokens$ = combineLatest([selectedSignerTokenBalancesWS$, validatedTokens$]).pipe(
  map(combineTokensDistinct),
  shareReplay(1),
);

// TODO when network changes signer changes as well? this could make 2 requests unnecessary - check
export const pools$: Observable<Pool[]> = combineLatest([allAvailableSignerTokens$, selectedNetworkSubj, selectedSigner$]).pipe(
  switchMap(([tkns, network, signer]) => {
    return signer ? rpc.loadPools(tkns, signer.signer, network.factoryAddress) : [];
  }),
  shareReplay(1),
);

// TODO pools and tokens emit events at same time - check how to make 1 event from it
export const tokenPrices$ = combineLatest([allAvailableSignerTokens$, reefPrice$, pools$]).pipe(
  map(toTokensWithPrice),
  shareReplay(1),
);
