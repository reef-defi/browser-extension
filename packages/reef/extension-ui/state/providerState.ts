import {BehaviorSubject, ReplaySubject} from "rxjs";
import {Provider} from "@reef-defi/evm-provider";
import {Network, Networks, utils} from "@reef-defi/react-lib";

export const provider$ = new ReplaySubject<Provider>(1);
export const networks$ = new BehaviorSubject<Networks>(utils.availableReefNetworks);
export const selectedNetwork$ = new BehaviorSubject<Network>(networks$.value.mainnet);
