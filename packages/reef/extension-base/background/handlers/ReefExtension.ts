import Extension from "@reef-defi/extension-base/background/handlers/Extension";
import State from "@reef-defi/extension-base/background/handlers/State";
import {
    MessageTypes,
    RequestAccountSelect,
    RequestNetworkSelect,
    RequestTypes,
    ResponseType
} from "@reef-defi/extension-base/background/types";
import keyring from "@polkadot/ui-keyring";
import {assert} from "@reef-defi/util";
import {accounts as accountsObservable} from "@polkadot/ui-keyring/observable/accounts";
import {BehaviorSubject} from "rxjs";
import {availableNetworks} from "@reef-defi/react-lib";
import {createSubscription, unsubscribe} from "@reef-defi/extension-base/background/handlers/subscriptions";

const REEF_NETWORK_RPC_URL_KEY = 'reefNetworkRpcUrl';
export const networkRpcUrlSubject: BehaviorSubject<string> = new BehaviorSubject<string>(localStorage.getItem(REEF_NETWORK_RPC_URL_KEY) || availableNetworks.mainnet.rpcUrl);

export default class ReefExtension extends Extension {

    constructor(state: State) {
        super(state);
    }

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
        const currSelected = keyring.getPairs().find(p => p.meta.isSelected === true);
        const newSelectPair = keyring.getPair(address);
        assert(newSelectPair, 'Unable to find pair');
        if (currSelected) {
            if (currSelected.address === address) {
                return true;
            }
            keyring.saveAccountMeta(currSelected, {...currSelected.meta, isSelected: false});
        }

        keyring.saveAccountMeta(newSelectPair, {...newSelectPair.meta, isSelected: true});

        accountsObservable.subject.next(accountsObservable.subject.getValue());
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

