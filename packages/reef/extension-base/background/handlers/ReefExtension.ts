import Extension from "@reef-defi/extension-base/background/handlers/Extension";
import State from "@reef-defi/extension-base/background/handlers/State";
import {
    MessageTypes,
    RequestAccountForget, RequestAccountSelect,
    RequestAccountShow,
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
        console.log("REEF HANDLER=", type);
        switch (type) {
            case "pri(accounts.select)":
                return this.accountsSelect(request as RequestAccountSelect);
        }
        return super.handle(id, type, request, port);
    }

    private accountsSelect ({ address }: RequestAccountSelect): boolean {
        console.log("accountsSelect=",address);
        const currSelected = keyring.getPairs().find(p => p.meta.isSelected === true);
        if(currSelected) {
            if (currSelected.address === address) {
                return true;
            }
            keyring.saveAccountMeta(currSelected, {...currSelected.meta, isSelected: false});
        }

        const pair = keyring.getPair(address);
        assert(pair, 'Unable to find pair');

        keyring.saveAccountMeta(pair, { ...pair.meta, isSelected:true });

        accountsObservable.subject.next(accountsObservable.subject.getValue());
        return true;
    }

    override accountsForget ({ address }: RequestAccountForget): boolean {
        const currSelected = keyring.getPairs().find(p => p.meta.isSelected === true);
        if(currSelected?.address===address){
            return false;
        }

        return super.accountsForget({address});
    }

    override accountsShow ({ address, isShowing }: RequestAccountShow): boolean {
        const pair = keyring.getPair(address);
        const currSelected = keyring.getPairs().find(p => p.meta.isSelected === true);
        if(currSelected?.address===address){
            return false;
        }

        assert(pair, 'Unable to find pair');

        keyring.saveAccountMeta(pair, { ...pair.meta, isHidden: !isShowing });

        return true;
    }

}

