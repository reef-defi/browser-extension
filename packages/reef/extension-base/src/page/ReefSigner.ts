import {Provider, Signer as ReefVMSigner} from '@reef-defi/evm-provider';
import Accounts from '@reef-defi/extension-base/page/Accounts';
import Signer from '@reef-defi/extension-base/page/Signer';
import {InjectedAccount, ReefInjectedSigner, Unsubcall} from '@reef-defi/extension-inject/types';

import {ReefProvider} from './ReefProvider';

export enum ReefVM {
    NATIVE,
    EVM
}

export class ReefSigner implements ReefInjectedSigner {
    private accounts: Accounts;
    private readonly extSigner: Signer;
    private injectedProvider: ReefProvider;
    private selectedProvider: Provider | undefined;
    private selectedSignerAccount: InjectedAccount | undefined;

    constructor(accounts: Accounts, extSigner: Signer, injectedProvider: ReefProvider) {
        this.accounts = accounts;
        this.extSigner = extSigner;
        this.injectedProvider = injectedProvider;
    }

    public subscribeSelectedAccount(cb: (accounts: InjectedAccount | undefined) => unknown): Unsubcall {
        return this.accounts.subscribe((accounts) => {
            cb(accounts.find((a) => a.isSelected));
        });
    }

    public async getSelectedAccount(): Promise<InjectedAccount | undefined> {
        const accounts = await this.accounts.get();
        return accounts.find((a) => a.isSelected);
    }

    public subscribeSelectedSigner(cb: (reefSigner: ReefVMSigner | undefined) => unknown, connectedVM: ReefVM = ReefVM.EVM): Unsubcall {
        const unsubProvFn = this.injectedProvider.subscribeSelectedNetworkProvider((provider) => {
            this.selectedProvider = provider;
            this.onSelectedSignerParamUpdate(cb, connectedVM).then(_ => {
            });
        });
        const unsubAccFn = this.subscribeSelectedAccount((account) => {
            if (account?.address !== this.selectedSignerAccount?.address) {
                this.selectedSignerAccount = account;
                this.onSelectedSignerParamUpdate(cb, connectedVM).then(_ => {
                });
            }
        });

        return (): void => {
            unsubProvFn();
            unsubAccFn();
        };
    }

    public async getSelectedSigner(connectedVM: ReefVM = ReefVM.EVM): Promise<ReefVMSigner | undefined> {
        let unsubProvFn = () => {
        };
        const providerPr: Promise<Provider> = new Promise(resolve => {
            unsubProvFn = this.injectedProvider.subscribeSelectedNetworkProvider((provider) => {
                resolve(provider);
            });
        });
        const acc = await this.getSelectedAccount();
        const prov = await providerPr;
        unsubProvFn();
        const selectedSigner = ReefSigner.createReefSigner(acc, prov, this.extSigner);
        if (await ReefSigner.hasConnectedVM(selectedSigner, connectedVM)) {
            return selectedSigner;
        }
        return undefined;
    }

    private async onSelectedSignerParamUpdate(cb: (reefSigner: (ReefVMSigner | undefined)) => unknown, connectedVM?: ReefVM): Promise<void> {
        const selectedSigner = ReefSigner.createReefSigner(this.selectedSignerAccount, this.selectedProvider, this.extSigner);
        if (await ReefSigner.hasConnectedVM(selectedSigner, connectedVM)) {
            cb(selectedSigner);
        }
    }

    private static createReefSigner(selectedSignerAccount?: InjectedAccount, selectedProvider?: Provider, extSigner?: Signer): ReefVMSigner | undefined {
        return selectedSignerAccount && selectedProvider && extSigner ? new ReefVMSigner(selectedProvider, selectedSignerAccount.address, extSigner) : undefined;
    }

    private static async hasConnectedVM(signer?: ReefVMSigner, connectedVM?: ReefVM): Promise<boolean> {
        if (!signer) {
            return false;
        }
        return !connectedVM || (connectedVM === ReefVM.EVM && await signer?.isClaimed());

    }
}
