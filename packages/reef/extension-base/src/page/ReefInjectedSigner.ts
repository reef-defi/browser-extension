import {InjectedAccount, Unsubcall} from "@reef-defi/extension-inject/types";
import Accounts from "@reef-defi/extension-base/page/Accounts";
import {Provider, Signer as ReefEVMSigner} from "@reef-defi/evm-provider";
import Signer from "@reef-defi/extension-base/page/Signer";
import {ReefInjectedProvider} from "./ReefInjectedProvider";

export class ReefInjectedSigner {

    private accounts: Accounts;
    private extSigner: Signer;
    private network: ReefInjectedProvider;
    private selectedProvider:  Provider | undefined;
    private selectedSignerAccount: InjectedAccount | undefined;

    constructor(accounts: Accounts, extSigner: Signer, network: ReefInjectedProvider) {
        this.accounts = accounts;
        this.extSigner = extSigner;
        this.network = network;
    }

    public subscribeSelectedAccount(cb: (accounts: InjectedAccount | undefined) => unknown): Unsubcall {
        this.accounts.subscribe(accounts => {
            cb(accounts.find(a => a.isSelected));
        });

        return (): void => {
            // FIXME we need the ability to unsubscribe
        };
    }

    public subscribeSelectedAccountSigner(cb: (reefEVMSigner: ReefEVMSigner | undefined) => unknown): Unsubcall {

        this.network.subscribeSelectedNetworkProvider((provider) => {
            this.selectedProvider = provider;
            this.onSelectedSignerParamUpdate(cb)
        })
        this.subscribeSelectedAccount(account => {
            if (account?.address !== this.selectedSignerAccount?.address) {
                this.selectedSignerAccount = account;
                this.onSelectedSignerParamUpdate(cb);
            }

        });

        return (): void => {
            // FIXME we need the ability to unsubscribe
        };
    }

    private onSelectedSignerParamUpdate(cb: (accounts: (ReefEVMSigner | undefined)) => unknown) {
        if (this.selectedSignerAccount && this.selectedProvider && this.extSigner) {
            cb(new ReefEVMSigner(this.selectedProvider, this.selectedSignerAccount.address, this.extSigner));
        }
    }

}
