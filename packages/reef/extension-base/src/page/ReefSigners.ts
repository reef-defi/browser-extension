import {InjectedAccount, Unsubcall} from "@reef-defi/extension-inject/types";
import Accounts from "@reef-defi/extension-base/page/Accounts";
import {availableNetworks, Network, utils} from "@reef-defi/react-lib";
import {Provider, Signer as ReefEVMSigner} from "@reef-defi/evm-provider";
import Signer from "@reef-defi/extension-base/page/Signer";

export class ReefSigners {

    private accounts: Accounts;
    private extSigner: Signer;
    private selectedSignerProvider: { network: Network; provider: Provider; }|undefined;
    private selectedSignerAccount: InjectedAccount | undefined;

    constructor(accounts: Accounts, extSigner: Signer) {
        this.accounts = accounts;
        this.extSigner = extSigner;
    }

    public subscribeSelectedAccount(cb: (accounts: InjectedAccount | undefined) => unknown): Unsubcall {
        this.accounts.subscribe(accounts => {
            cb(accounts.find(a => a.isSelected));
        })

        return (): void => {
            // FIXME we need the ability to unsubscribe
        };
    }

    public subscribeSelectedAccountSigner(cb: (reefEVMSigner: ReefEVMSigner | undefined) => unknown): Unsubcall {

        this.subscribeSelectedNetworkProvider(_ => {
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

    private async subscribeSelectedNetworkProvider(cb: (provider: Provider) => void) {
        // TODO get network from subscription and make public
        let network = availableNetworks.mainnet;
        if (this.selectedSignerProvider?.network.rpcUrl !== network.rpcUrl) {
            this.selectedSignerProvider?.provider.api.disconnect();

            this.selectedSignerProvider = {
                network: network,
                provider: await utils.initProvider(network.rpcUrl)
            }
        }

        cb(this.selectedSignerProvider.provider);
    }

    private onSelectedSignerParamUpdate(cb: (accounts: (ReefEVMSigner | undefined)) => unknown) {
        if (this.selectedSignerAccount && this.selectedSignerProvider?.provider && this.extSigner) {
            cb(new ReefEVMSigner(this.selectedSignerProvider.provider, this.selectedSignerAccount.address, this.extSigner))
        }
    }
}
