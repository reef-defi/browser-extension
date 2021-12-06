import {BehaviorSubject, ReplaySubject} from "rxjs";
import {Provider} from "@reef-defi/evm-provider"
import {Network, Pool, ReefSigner, Token} from "@reef-defi/react-lib";
import {currentNetwork} from "../environment";

export const appProvider$ = new ReplaySubject<Provider>(1);
export const appSelectedSigner$ = new ReplaySubject<ReefSigner>(1);
export const appNetwork$ = new BehaviorSubject<Network>(currentNetwork);
export const reefPrice$ = new ReplaySubject<number>(1);
export const appPools$ = new ReplaySubject<Pool[]>(1);
export const appSignerTokens$ = new ReplaySubject<Token[]>(1);

