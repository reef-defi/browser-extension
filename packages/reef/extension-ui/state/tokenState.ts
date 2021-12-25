import {combineLatest, map, Observable, of, shareReplay, startWith, Subject, switchMap, timer} from "rxjs";
import {filter} from 'rxjs/operators';
import {api, Network, Pool, ReefSigner, rpc, Token} from "@reef-defi/react-lib";
import {combineTokensDistinct, toTokensWithPrice} from "./util";
import {
  selectedNetwork$,
  selectedSignerUpdateCtx$,
} from "./appState";
import {selectedSigner$} from "./accountState";
import {getAddressUpdateActionTypes, UpdateDataCtx, UpdateDataType} from "./updateCtxUtil";

const validatedTokens = require('../validated-tokens-mainnet.json');

export const reefPrice$ = timer(0, 60000).pipe(
  switchMap(api.retrieveReefCoingeckoPrice),
  shareReplay(1)
);

// @ts-ignore
export const validatedTokens$ = of(validatedTokens.tokens as Token[]);
export const reloadSignerTokens$ = new Subject<void>();

export const selectedSignerTokenBalances$ = combineLatest([selectedSignerUpdateCtx$, selectedNetwork$, reloadSignerTokens$.pipe(startWith(null))]).pipe(
  switchMap(([signerCtx, network, _]: [UpdateDataCtx<ReefSigner>, Network, any]) => {
    if (!signerCtx.data) {
      return Promise.resolve([]);
    }
    let isTokenUpdate = getAddressUpdateActionTypes(signerCtx.data.address, signerCtx.updateActions).indexOf(UpdateDataType.ACCOUNT_TOKENS) >= 0;
    if (!isTokenUpdate) {
      return Promise.resolve(undefined);
    }
    return api.loadSignerTokens(signerCtx.data, network);
  }),
// @ts-ignore
  filter((v: Token[] | undefined) => v !== undefined),
  shareReplay(1)
) as Observable<Token[]>;

export const allAvailableSignerTokens$ = combineLatest([selectedSignerTokenBalances$, validatedTokens$]).pipe(
  map(combineTokensDistinct),
  shareReplay(1)
);

// TODO when network changes signer changes as well? this could make 2 requests unnecessary - check
export const pools$: Observable<Pool[]> = combineLatest([allAvailableSignerTokens$, selectedNetwork$, selectedSigner$]).pipe(
  switchMap(([tkns, network, signer]) => signer ? rpc.loadPools(tkns, signer.signer, network.factoryAddress) : []),
  shareReplay(1)
)

// TODO pools and tokens emit events at same time - check how to make 1 event from it
export const tokenPrices$ = combineLatest([allAvailableSignerTokens$, reefPrice$, pools$]).pipe(
  map(toTokensWithPrice),
  shareReplay(1)
)
