import {BehaviorSubject, ReplaySubject} from 'rxjs';
import {Provider} from '@reef-defi/evm-provider';
import {Network, Networks, utils} from '@reef-defi/react-lib';
import {innitialNetwork} from "./environment";

export const providerSubj = new ReplaySubject<Provider>(1);
export const networksSubj = new BehaviorSubject<Networks>(utils.availableReefNetworks);
export const selectedNetworkSubj = new BehaviorSubject<Network>(innitialNetwork);
selectedNetworkSubj.subscribe((network) => console.log('NETWORK=', network.rpcUrl));
