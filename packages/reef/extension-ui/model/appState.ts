import {BehaviorSubject, combineLatest, timer, map, Observable, of, ReplaySubject, switchMap} from "rxjs";
import {Provider} from "@reef-defi/evm-provider"
import {api, Network, Pool, ReefSigner, rpc, Token} from "@reef-defi/react-lib";
import {currentNetwork} from "../environment";
import {combineTokensDistinct, toTokensWithPrice} from "./util";

const validatedTokens = require('../validated-tokens-mainnet.json');

export const appProvider$ = new ReplaySubject<Provider>(1);
export const appSelectedSigner$ = new ReplaySubject<ReefSigner>(1);
export const appNetwork$ = new BehaviorSubject<Network>(currentNetwork);
export const reefPrice$ = timer(0,60000).pipe(switchMap(api.retrieveReefCoingeckoPrice));

// @ts-ignore
export const appTokens: { validatedTokens$: Observable<Token[]>, reloadSignerTokens$: ReplaySubject<void>, signerTokens$: Observable<Token[]>, availableTokens$: Observable<Token[]> } = {}
appTokens.validatedTokens$ = of(validatedTokens.tokens as Token[]);
appTokens.reloadSignerTokens$ = new ReplaySubject<void>(1);
appTokens.signerTokens$ = combineLatest([appSelectedSigner$, appNetwork$, appTokens.reloadSignerTokens$]).pipe(
  switchMap(([signer, network, _]: [ReefSigner, Network, any]) => api.loadSignerTokens(signer, network))
);
appTokens.availableTokens$ = combineLatest([appTokens.signerTokens$, appTokens.validatedTokens$]).pipe(
  map(combineTokensDistinct)
);

// TODO when network changes signer changes as well? this could make 2 requests unnecessary - check
export const appPools$: Observable<Pool[]>= combineLatest([appTokens.availableTokens$, appNetwork$, appSelectedSigner$]).pipe(
  switchMap(([tkns, network, signer]) => rpc.loadPools(tkns, signer.signer, network.factoryAddress))
)

// TODO pools and tokens emit events at same time - check how to make 1 event from it

export const tokenPrices$ = combineLatest([appTokens.availableTokens$, reefPrice$, appPools$]).pipe(
  map(toTokensWithPrice)
)
