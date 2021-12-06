import {assert} from "@polkadot/util";
import keyring from "@polkadot/ui-keyring";
import {RequestAccountSelect} from "./types-reef";
import {createSubscription} from "@reef-defi/extension-base/background/handlers/subscriptions";
import {MessageTypes, RequestTypes, ResponseType} from "@reef-defi/extension-base/background/types";

export class ExtensionHandlersReef {
  private accountSelectCb: any = null;

  private accountSelect(port: chrome.runtime.Port, {address}: RequestAccountSelect): boolean {
    const pair = keyring.getPair(address);
    assert(pair, 'Unable to find pair');
    localStorage.setItem('selected_address_' + port.name, address);
    this.accountSelectCb({address: pair.address});
    return true;
  }

  private accountSelected(id: string, port: chrome.runtime.Port): boolean {
    let account;
    const savedAddress = localStorage.getItem('selected_address_' + port.name);
    if (savedAddress) {
      account = keyring.getAccount(savedAddress);
    }
    if (!account) {
      account = keyring.getAccounts()[0];
    }
    this.accountSelectCb = createSubscription<'pri(accounts.selected)'>(id, port);
    this.accountSelectCb(account ? {address: account.address, ...account.meta} : null);
    return true;
  }

  public async handle<TMessageType extends MessageTypes>(id: string, type: TMessageType, request: RequestTypes[TMessageType], port: chrome.runtime.Port): Promise<ResponseType<TMessageType>> {
    switch (type) {
      case 'pri(accounts.select)':
        return this.accountSelect(port, request as RequestAccountSelect);
      case 'pri(accounts.selected)':
        return this.accountSelected(id, port);

      default:
        return undefined;
    }
  }

}
