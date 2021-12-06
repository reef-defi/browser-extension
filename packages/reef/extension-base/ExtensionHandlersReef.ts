import {assert} from "@polkadot/util";
import keyring from "@polkadot/ui-keyring";
import {RequestAccountSelect} from "./types-reef";
import {createSubscription} from "@reef-defi/extension-base/background/handlers/subscriptions";
import {MessageTypes, RequestTypes, ResponseType} from "@reef-defi/extension-base/background/types";

export class ExtensionHandlersReef {
  private cb: any = null;

  private accountsSelect(id: string, port: chrome.runtime.Port, {address}: RequestAccountSelect): boolean {
    console.log("SSSS=", address);
    const pair = keyring.getPair(address);
    assert(pair, 'Unable to find pair');
    localStorage.setItem('selected_address_' + port.name, address);

    console.log("SAVE =", address, 'selected_address_' + port.name);
    this.cb({address: pair.address});
    return true;
  }

  private accountSelected(id: string, port: chrome.runtime.Port): boolean {
    let account;
    const savedAddress = localStorage.getItem('selected_address_' + port.name);
    if (savedAddress) {
      account = keyring.getAccount(savedAddress);
    }
    console.log("SEL =", account, savedAddress, 'selected_address_' + port.name);
    if (!account) {
      account = keyring.getAccounts()[0];
    }
    this.cb = createSubscription<'pri(accounts.selected)'>(id, port);
    this.cb(account ? {address: account.address, ...account.meta} : null);
    return true;
  }

  public async handle<TMessageType extends MessageTypes>(id: string, type: TMessageType, request: RequestTypes[TMessageType], port: chrome.runtime.Port): Promise<ResponseType<TMessageType>> {
    switch (type) {
      case 'pri(accounts.select)':
        return this.accountsSelect(id, port, request as RequestAccountSelect);
      case 'pri(accounts.selected)':
        return this.accountSelected(id, port);

      default:
        return undefined;
    }
  }

}
