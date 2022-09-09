import Extension from "@reef-defi/extension-base/background/handlers/Extension";
import {
    AccountJson,
    MessageTypes,
    RequestAccountSelect,
    RequestNetworkSelect,
    RequestTypes,
    ResponseType
} from "@reef-defi/extension-base/background/types";
import keyring from "@polkadot/ui-keyring";
import {assert} from "@reef-defi/util";
import {BehaviorSubject} from "rxjs";
import {availableNetworks} from "@reef-defi/react-lib";
import {createSubscription, unsubscribe} from "@reef-defi/extension-base/background/handlers/subscriptions";
import {InjectedAccount} from "@reef-defi/extension-inject/types";

const REEF_NETWORK_RPC_URL_KEY = 'reefNetworkRpcUrl';
export const networkRpcUrlSubject: BehaviorSubject<string> = new BehaviorSubject<string>(localStorage.getItem(REEF_NETWORK_RPC_URL_KEY) || availableNetworks.mainnet.rpcUrl);

export function setSelectedAccount<T extends AccountJson|InjectedAccount>(accountsJson: T[], index: number|undefined): T[] {
    if (accountsJson.length && index!=null) {
        accountsJson.forEach((a, i) => {
            a.isSelected = i === index
        });
    }
    return accountsJson;
}

export function getSelectedAccountIndex(accountsMeta: { meta:any }[]): number|undefined {
    if (accountsMeta.length) {
        const accsSelectedTsArr = accountsMeta.map(a => a.meta._isSelectedTs);
        const lastSelectedSort = accsSelectedTsArr.sort((a, b) => {
            const selectedAAt = a || 0;
            const selectedBAt = b || 0;
            return selectedBAt - selectedAAt;
        });
        const lastTs = lastSelectedSort[0];
        return accountsMeta.findIndex(am => am.meta._isSelectedTs === lastTs);
    }
    return undefined;
}

export default class ReefExtension extends Extension {

    override async handle<TMessageType extends MessageTypes>(id: string, type: TMessageType, request: RequestTypes[TMessageType], port: chrome.runtime.Port): Promise<ResponseType<TMessageType>> {
        switch (type) {
            case "pri(accounts.select)":
                return this.accountsSelect(request as RequestAccountSelect);
            case 'pri(network.select)':
                return this.networkSelect(request as RequestNetworkSelect);
            case 'pri(network.subscribe)':
                return this.networkSubscribe(id, port);

        }
        return super.handle(id, type, request, port);
    }

    private accountsSelect({address}: RequestAccountSelect): boolean {
        const newSelectPair = keyring.getPair(address);
        assert(newSelectPair, 'Unable to find pair');
        // using timestamp since subject emits on every meta change - so can't unselect old without event
        keyring.saveAccountMeta(newSelectPair, {...newSelectPair.meta, _isSelectedTs: (new Date()).getTime()});


        // accountsObservable.subject.next(accountsObservable.subject.getValue());
        return true;
    }

    private networkSelect({rpcUrl}: RequestNetworkSelect) {
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

