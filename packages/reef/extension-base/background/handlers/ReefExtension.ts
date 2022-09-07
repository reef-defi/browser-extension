import Extension from '@reef-defi/extension-base/background/handlers/Extension';
import { createSubscription, unsubscribe } from '@reef-defi/extension-base/background/handlers/subscriptions';
import { AccountJson, MessageTypes, RequestAccountSelect, RequestNetworkSelect, RequestTypes, ResponseType } from '@reef-defi/extension-base/background/types';
import { availableNetworks } from '@reef-defi/react-lib';
import { assert } from '@reef-defi/util';
import { BehaviorSubject } from 'rxjs';

import keyring from '@polkadot/ui-keyring';
// import chrome from "@reef-defi/extension-inject/chrome";

const REEF_NETWORK_RPC_URL_KEY = 'reefNetworkRpcUrl';

export const networkRpcUrlSubject: BehaviorSubject<string> = new BehaviorSubject<string>(localStorage.getItem(REEF_NETWORK_RPC_URL_KEY) || availableNetworks.mainnet.rpcUrl);

export function setSelectedAccount (accountsJson: AccountJson[]): AccountJson[] {
  if (accountsJson.length) {
    const lastSelectedSort = accountsJson.sort((a, b) => {
      const selectedAAt = a._isSelectedTs as number || 0;
      const selectedBAt = b._isSelectedTs as number || 0;

      return selectedBAt - selectedAAt;
    });
    const selected = lastSelectedSort[0];

    accountsJson.forEach((aJson) => {
      aJson.isSelected = aJson.address === selected.address;
    });
  }

  return accountsJson;
}

export default class ReefExtension extends Extension {
  override async handle<TMessageType extends MessageTypes> (id: string, type: TMessageType, request: RequestTypes[TMessageType], port: chrome.runtime.Port): Promise<ResponseType<TMessageType>> {
    switch (type) {
      case 'pri(accounts.select)':
        return this.accountsSelect(request as RequestAccountSelect);
      case 'pri(network.select)':
        return this.networkSelect(request as RequestNetworkSelect);
      case 'pri(network.subscribe)':
        return this.networkSubscribe(id, port);
    }

    return super.handle(id, type, request, port);
  }

  private accountsSelect ({ address }: RequestAccountSelect): boolean {
    const newSelectPair = keyring.getPair(address);

    assert(newSelectPair, 'Unable to find pair');
    // using timestamp since subject emits on every meta change - so can't unselect old without event
    keyring.saveAccountMeta(newSelectPair, { ...newSelectPair.meta, _isSelectedTs: (new Date()).getTime() });

    // accountsObservable.subject.next(accountsObservable.subject.getValue());
    return true;
  }

  private networkSelect ({ rpcUrl }: RequestNetworkSelect) {
    localStorage.setItem(REEF_NETWORK_RPC_URL_KEY, rpcUrl);
    networkRpcUrlSubject.next(rpcUrl);

    return true;
  }

  private networkSubscribe (id: string, port: chrome.runtime.Port): boolean {
    const cb = createSubscription<'pri(network.subscribe)'>(id, port);
    const subscription = networkRpcUrlSubject.subscribe((rpcUrl: string): void =>
      cb(rpcUrl)
    );

    port.onDisconnect.addListener((): void => {
      unsubscribe(id);
      subscription.unsubscribe();
    });

    return true;
  }
}
