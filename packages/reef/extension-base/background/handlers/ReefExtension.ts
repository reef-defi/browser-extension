import Extension from "@reef-defi/extension-base/background/handlers/Extension";
import State from "@reef-defi/extension-base/background/handlers/State";
import {
    MessageTypes,
    RequestAccountSelect,
    RequestTypes,
    ResponseType
} from "@reef-defi/extension-base/background/types";
// import chrome from "@reef-defi/extension-inject/chrome";
import keyring from "@polkadot/ui-keyring";
import {assert} from "@reef-defi/util";
import {accounts as accountsObservable} from "@polkadot/ui-keyring/observable/accounts";

export default class ReefExtension extends Extension {

    constructor (state: State) {
        super(state);
    }

    override async handle<TMessageType extends MessageTypes> (id: string, type: TMessageType, request: RequestTypes[TMessageType], port: chrome.runtime.Port): Promise<ResponseType<TMessageType>> {
        switch (type) {
            case "pri(accounts.select)":
                return this.accountsSelect(request as RequestAccountSelect);
        }
        return super.handle(id, type, request, port);
    }

    private accountsSelect ({ address }: RequestAccountSelect): boolean {
        const currSelected = keyring.getPairs().find(p => p.meta.isSelected === true);
        const newSelectPair = keyring.getPair(address);
        assert(newSelectPair, 'Unable to find pair');
        // assert(!newSelectPair.meta.isHidden, 'Can not select hidden account');
        if(currSelected) {
            if (currSelected.address === address) {
                return true;
            }
            keyring.saveAccountMeta(currSelected, {...currSelected.meta, isSelected: false});
        }

        keyring.saveAccountMeta(newSelectPair, { ...newSelectPair.meta, isSelected:true });

        accountsObservable.subject.next(accountsObservable.subject.getValue());
        return true;
    }

}

