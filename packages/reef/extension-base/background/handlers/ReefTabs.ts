import State from '@reef-defi/extension-base/background/handlers/State';
import { createSubscription, unsubscribe } from '@reef-defi/extension-base/background/handlers/subscriptions';
import Tabs from '@reef-defi/extension-base/background/handlers/Tabs';
import { MessageTypes, RequestTypes, ResponseTypes } from '@reef-defi/extension-base/background/types';

import { networkRpcUrlSubject } from './ReefExtension';

export class ReefTabs extends Tabs {
  constructor (state: State) {
    super(state);
  }

  override async handle<TMessageType extends MessageTypes> (id: string, type: TMessageType, request: RequestTypes[TMessageType], url: string, port: chrome.runtime.Port): Promise<ResponseTypes[keyof ResponseTypes]> {
    switch (type) {
      case 'pub(network.subscribe)':
        return this.networkSubscribe(id, port);
    }

    super.handle(id, type, request, url, port);
  }

  private networkSubscribe (id: string, port: chrome.runtime.Port): boolean {
    const cb = createSubscription<'pub(network.subscribe)'>(id, port);
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
