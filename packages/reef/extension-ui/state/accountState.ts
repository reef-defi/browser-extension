import {
  combineLatest,
  distinctUntilChanged,
  map,
  mergeScan,
  Observable,
  of,
  ReplaySubject,
  scan,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import {sendMessage} from "@reef-defi/extension-ui/messaging";
import {ReefSigner} from '@reef-defi/react-lib';
import {Provider} from '@reef-defi/evm-provider';
import {BigNumber} from 'ethers';
import {filter} from 'rxjs/operators';
import {UpdateDataCtx} from './updateCtxUtil';
import {replaceUpdatedSigners, updateSignersEvmBindings} from './accountStateUtil';
import {providerSubj} from './providerState';
import {AccountJson} from "@reef-defi/extension-base/background/types";
import {toReefSigner, zenToRx} from "./util";
import Signer from "@reef-defi/extension-base/page/Signer";
import {gql} from "@apollo/client";
import {apolloClientInstance$} from "../graphql/apolloConfig";

const injectionSigner = new Signer(sendMessage);

export const accounts$ = new ReplaySubject<AccountJson[] | null>(1);
export const reloadSignersSubject = new Subject<UpdateDataCtx<ReefSigner[]>>();

const signersInjected$ = combineLatest([providerSubj, of(injectionSigner), accounts$]).pipe(
  switchMap(([provider, signer, accounts]) => {
    if (!accounts || !accounts?.length) {
      return of([]);
    }
    return Promise.all<ReefSigner>(accounts.map(acc => toReefSigner(acc, provider, signer)));
  }),
  shareReplay(1)
);

export const reloadSignersSubj = new Subject<UpdateDataCtx<ReefSigner[]>>();

const signersLocallyUpdatedData$: Observable<ReefSigner[]> = reloadSignersSubject.pipe(
  filter((reloadCtx) => !!reloadCtx.updateActions.length),
  withLatestFrom(signersInjected$),
  mergeScan((state: { all: ReefSigner[], allUpdated: ReefSigner[], lastUpdated: ReefSigner[] }, [updateCtx, signersInjected]): any => {
    const allSignersLatestUpdates = replaceUpdatedSigners(signersInjected, state.allUpdated);
    return of(updateCtx.updateActions).pipe(
      switchMap((updateActions) => updateSignersEvmBindings(updateActions, allSignersLatestUpdates)
        .then((lastUpdated) => ({
          all: replaceUpdatedSigners(allSignersLatestUpdates, lastUpdated, true),
          allUpdated: replaceUpdatedSigners(state.allUpdated, lastUpdated, true),
          lastUpdated,
        }))),
    );
  }, {
    all: [], allUpdated: [], lastUpdated: [],
  }),
  filter((val: any) => !!val.lastUpdated.length),
  map((val: any): any => (val.all)),
  startWith([]),
  shareReplay(1),
);

const signersWithUpdatedBalances$ = combineLatest([providerSubj, signersInjected$]).pipe(
  mergeScan((state: {unsub:any, balancesByAddressSubj: ReplaySubject<any>}, [provider, signers]: [Provider, ReefSigner[]]) => {
    if (state.unsub) {
      state.unsub();
    }
    const distinctSignerAddresses = signers.map((s) => s.address)
      .reduce((distinctAddrList: string[], curr: string) => {
        if (distinctAddrList.indexOf(curr) < 0) {
          distinctAddrList.push(curr);
        }
        return distinctAddrList;
      }, []);
    // eslint-disable-next-line no-param-reassign
    return provider.api.query.system.account.multi(distinctSignerAddresses, (balances: any[]) => {
      const balancesByAddr = balances.map(({ data }, index) => ({ address: distinctSignerAddresses[index], balance: data.free.toString() }));
      state.balancesByAddressSubj.next({ balances: balancesByAddr, signers });
    }).then((unsub) => {
      // eslint-disable-next-line no-param-reassign
      state.unsub = unsub;
      return state;
    });
  }, { unsub: null, balancesByAddressSubj: (new ReplaySubject<any>(1)) }),
  distinctUntilChanged((prev: any, curr: any): any => prev.balancesByAddressSubj !== curr.balancesByAddressSubj),
  switchMap((v:{balancesByAddressSubj: Subject<{balances:any, signers: ReefSigner[]}>}) => v.balancesByAddressSubj),
  map((balancesAndSigners:{balances:any, signers: ReefSigner[]}) => (!balancesAndSigners.signers ? [] : balancesAndSigners.signers.map((sig) => {
    const bal = balancesAndSigners.balances.find((b:{address: string, balance: string}) => b.address === sig.address);
    if (bal && !BigNumber.from(bal.balance).eq(sig.balance)) {
      return { ...sig, balance: BigNumber.from(bal.balance) };
    }
    return sig;
  }))),
  shareReplay(1),
);

const EVM_ADDRESS_UPDATE_GQL = gql`
subscription query($accountIds: [String!]!){
    account(
        where: {address: {_in: $accountIds}},
        order_by: {timestamp: asc, address: asc}
    ) {
    address
    evm_address
  }
}`;
// eslint-disable-next-line camelcase
interface AccountEvmAddrData { address: string; evm_address?: string; isEvmClaimed?: boolean }
export const indexedAccountValues$ = combineLatest([apolloClientInstance$, signersInjected$]).pipe(
  switchMap(([apollo, signers]) => (!signers ? []
      : zenToRx(apollo.subscribe({
        query: EVM_ADDRESS_UPDATE_GQL,
        variables: { accountIds: signers.map((s: any) => s.address) },
        fetchPolicy: 'network-only',
      }))
  )),
  map((result:any):AccountEvmAddrData[] => result.data.account),
  filter((v) => !!v),
  startWith([]),
);

const signersWithUpdatedData$ = combineLatest([signersWithUpdatedBalances$, signersLocallyUpdatedData$, indexedAccountValues$]).pipe(
  scan((state:{lastlocallyUpdated:ReefSigner[], lastIndexed:AccountEvmAddrData[], lastSigners: ReefSigner[]}, [signers, locallyUpdated, indexed]) => {
    let updateBindValues: AccountEvmAddrData[] = [];
    if (state.lastlocallyUpdated !== locallyUpdated) {
      updateBindValues = locallyUpdated.map((updSigner) => ({ address: updSigner.address, isEvmClaimed: updSigner.isEvmClaimed }));
    } else if (state.lastIndexed !== indexed) {
      updateBindValues = indexed.map((updSigner:AccountEvmAddrData)=>({address:updSigner.address, isEvmClaimed:!!updSigner.evm_address}));
    }else{
      updateBindValues = state.lastSigners.map((updSigner) => ({ address: updSigner.address, isEvmClaimed: updSigner.isEvmClaimed }));
    }
    updateBindValues.forEach((updVal: AccountEvmAddrData) => {
      const signer = signers.find((sig) => sig.address === updVal.address);
      if (signer) {
        signer.isEvmClaimed = !!updVal.isEvmClaimed;
      }
    });
    return { signers, lastlocallyUpdated: locallyUpdated, lastIndexed: indexed, lastSigners:signers };
  }, { signers: [], lastlocallyUpdated: [], lastIndexed: [], lastSigners:[] }),
  map(({ signers }) => signers),
);

export const signers$: Observable<ReefSigner[]> = signersWithUpdatedData$;

export const selectAddressSubj = new ReplaySubject<string | undefined>(1);
selectAddressSubj.next(localStorage.getItem('selected_address_reef') || undefined);

export const selectedSigner$ = combineLatest([selectAddressSubj.pipe(distinctUntilChanged()), signers$]).pipe(
  map(([selectedAddress, signers]) => {
    let foundSigner = signers?.find((signer: ReefSigner) => signer.address === selectedAddress);
    if (!foundSigner) {
      foundSigner = signers ? signers[0] : undefined;
    }
    if (foundSigner) {
      localStorage.setItem('selected_address_reef', foundSigner.address || '');
    }
    return foundSigner ? { ...foundSigner } : undefined;
  }),
  shareReplay(1),
);
