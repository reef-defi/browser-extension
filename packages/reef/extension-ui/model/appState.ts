import {BehaviorSubject, combineLatest, timer, map, Observable, of, ReplaySubject, switchMap, shareReplay} from "rxjs";
import {Provider} from "@reef-defi/evm-provider"
import {api, Network, Pool, ReefSigner, rpc, Token} from "@reef-defi/react-lib";
import {currentNetwork} from "../environment";
import {combineTokensDistinct, toTokensWithPrice} from "./util";
import {AccountJson} from "@reef-defi/extension-base/background/types";
import Injected from "@reef-defi/extension-base/page/Injected";
import {sendMessage} from "@reef-defi/extension-base/page";
import Signer from "@reef-defi/extension-base/page/Signer";
import {InjectedAccountWithMeta} from "@reef-defi/extension-inject/types";

const validatedTokens = require('../validated-tokens-mainnet.json');

export const appProvider$ = new ReplaySubject<Provider>(1);
export const appSelectedAccount$ = new ReplaySubject<AccountJson>(1);
export const appSelectedSigner$ = combineLatest([of(new Injected(sendMessage).signer), appProvider$, appSelectedAccount$]).pipe(
  switchMap(([injectionSigner, provider, acc]: [Signer, Provider, AccountJson]) => {
    const accWithMeta: InjectedAccountWithMeta = {
      address: acc.address,
      meta: {
        genesisHash: acc.genesisHash,
        name: acc.name,
        source: acc.name || ''
      },
      type: acc.type
    };
    console.log("Acccc=",accWithMeta);
    return rpc.accountToSigner(accWithMeta, provider, injectionSigner)
  }),
  shareReplay(1)
);
appSelectedAccount$.subscribe((value )  => {
  console.log("VVV=",value);
})
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
