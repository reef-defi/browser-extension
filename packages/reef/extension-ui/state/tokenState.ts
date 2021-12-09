import {combineLatest, map, Observable, of, ReplaySubject, shareReplay, switchMap, timer} from "rxjs";
import {api, Network, Pool, ReefSigner, rpc, Token} from "@reef-defi/react-lib";
import {combineTokensDistinct, toTokensWithPrice} from "./util";
import {selectedNetwork$} from "./appState";
import { selectedSigner$} from "./accountState";

const validatedTokens = require('../validated-tokens-mainnet.json');

export const reefPrice$ = timer(0, 60000).pipe(
  switchMap(api.retrieveReefCoingeckoPrice),
  shareReplay(1)
);

// @ts-ignore
export const validatedTokens$ = of(validatedTokens.tokens as Token[]);
export const reloadSignerTokens$ = new ReplaySubject<void>(1);
export const selectedSignerTokenBalances$ = combineLatest([selectedSigner$, selectedNetwork$, reloadSignerTokens$]).pipe(
  switchMap(([signer, network, _]: [ReefSigner | null, Network, any]) => signer ? api.loadSignerTokens(signer, network) : []),
  shareReplay(1)
);
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
