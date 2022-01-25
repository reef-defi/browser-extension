import {BehaviorSubject, ReplaySubject} from 'rxjs';
import {Provider} from '@reef-defi/evm-provider';
import {Network, Networks, utils} from '@reef-defi/react-lib';

export const providerSubj = new ReplaySubject<Provider>(1);
export const networksSubj = new BehaviorSubject<Networks>(utils.availableReefNetworks);
export const selectedNetworkSubj = new BehaviorSubject<Network>(utils.availableReefNetworks.mainnet);
/*export const selectedNetworkSubj = new BehaviorSubject<Network>({
  name: 'testnet',
  rpcUrl: 'ws://localhost:9944',
  reefscanUrl: 'http://localhost:8000',
  factoryAddress: '0xcA36bA38f2776184242d3652b17bA4A77842707e',
  routerAddress: '0x0A2906130B1EcBffbE1Edb63D5417002956dFd41',
});*/
selectedNetworkSubj.subscribe((network) => console.log('NETWORK=', network.rpcUrl));
