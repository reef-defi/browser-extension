import { Provider, Signer as ReefVMSigner } from '@reef-defi/evm-provider';
import Accounts from '@reef-defi/extension-base/page/Accounts';
import SigningKey from '@reef-defi/extension-base/page/Signer';
import { InjectedAccount, ReefInjectedSigner, ReefSignerResponse, ReefSignerStatus, ReefVM, Unsubcall } from '@reef-defi/extension-inject/types';

import { ReefProvider } from './ReefProvider';

export class ReefSigner implements ReefInjectedSigner {
  private accounts: Accounts;
  private readonly extSigningKey: SigningKey;
  private injectedProvider: ReefProvider;
  private selectedProvider: Provider | undefined;
  private selectedSignerAccount: InjectedAccount | undefined;

  constructor (accounts: Accounts, extSigner: SigningKey, injectedProvider: ReefProvider) {
    this.accounts = accounts;
    this.extSigningKey = extSigner;
    this.injectedProvider = injectedProvider;
  }

  public subscribeSelectedAccount (cb: (accounts: InjectedAccount | undefined) => unknown): Unsubcall {
    return this.accounts.subscribe((accounts) => {
      cb(accounts.find((a) => a.isSelected));
    });
  }

  public async getSelectedAccount (): Promise<InjectedAccount | undefined> {
    const accounts = await this.accounts.get();

    return accounts.find((a) => a.isSelected);
  }

  public subscribeSelectedSigner (cb: (reefSigner: ReefSignerResponse) => unknown, connectedVM: ReefVM = ReefVM.EVM): Unsubcall {
    const unsubProvFn = this.injectedProvider.subscribeSelectedNetworkProvider((provider) => {
      this.selectedProvider = provider;
      this.onSelectedSignerParamUpdate(cb, connectedVM).then(
        () => { // do nothing
        },
        () => {
          console.log('Error in onSelectedSignerParamUpdate');
        }
      );
    });
    const unsubAccFn = this.subscribeSelectedAccount((account) => {
      if (account?.address !== this.selectedSignerAccount?.address) {
        this.selectedSignerAccount = account;
        this.onSelectedSignerParamUpdate(cb, connectedVM).then(
          () => { // do nothing
          },
          () => {
            console.log('Error in onSelectedSignerParamUpdate');
          }
        );
      }
    });

    return (): void => {
      unsubProvFn();
      unsubAccFn();
    };
  }

  public async getSelectedSigner (connectedVM: ReefVM = ReefVM.EVM): Promise<ReefSignerResponse> {
    let unsubProvFn = () => {
      // do nothing
    };

    const providerPr: Promise<Provider> = new Promise((resolve) => {
      unsubProvFn = this.injectedProvider.subscribeSelectedNetworkProvider((provider) => {
        resolve(provider);
      });
    });
    const acc = await this.getSelectedAccount();
    const prov = await providerPr;
    const selectedSigner = ReefSigner.createReefSigner(acc, prov, this.extSigningKey);
    const hasVM = await ReefSigner.hasConnectedVM(connectedVM, selectedSigner);

    unsubProvFn();

    return this.getResponseStatus(selectedSigner, hasVM, connectedVM);
  }

  private async onSelectedSignerParamUpdate (cb: (reefSigner: ReefSignerResponse) => unknown, connectedVM: ReefVM): Promise<void> {
    const selectedSigner = ReefSigner.createReefSigner(this.selectedSignerAccount, this.selectedProvider, this.extSigningKey);
    const hasVM = await ReefSigner.hasConnectedVM(connectedVM, selectedSigner);
    const retStatus = this.getResponseStatus(selectedSigner, hasVM, connectedVM);

    if (retStatus.status !== ReefSignerStatus.CONNECTING) {
      cb(retStatus);
    }
  }

  private getResponseStatus (selectedSigner?: ReefVMSigner | undefined, hasVM?: boolean, requestedVM: ReefVM = ReefVM.NATIVE): ReefSignerResponse {
    if (selectedSigner) {
      if (hasVM) {
        return { data: selectedSigner, status: ReefSignerStatus.OK, requestedVM };
      } else {
        return { data: undefined, status: ReefSignerStatus.SELECTED_NO_VM_CONNECTION, requestedVM };
      }
    } else if (this.selectedProvider && this.extSigningKey) {
      if (!this.selectedSignerAccount) {
        return { data: undefined, status: ReefSignerStatus.NO_ACCOUNT_SELECTED, requestedVM };
      }
    }

    return { data: undefined, status: ReefSignerStatus.CONNECTING, requestedVM };
  }

  private static createReefSigner (selectedSignerAccount?: InjectedAccount, selectedProvider?: Provider, extSigner?: SigningKey): ReefVMSigner | undefined {
    return selectedSignerAccount && selectedProvider && extSigner ? new ReefVMSigner(selectedProvider, selectedSignerAccount.address, extSigner) : undefined;
  }

  private static async hasConnectedVM (connectedVM: ReefVM, signer?: ReefVMSigner): Promise<boolean> {
    if (!signer) {
      return false;
    }

    return !connectedVM || (connectedVM === ReefVM.EVM && await signer?.isClaimed());
  }
}
