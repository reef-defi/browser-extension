import { Provider, Signer as ReefVMSigner } from '@reef-defi/evm-provider';
import Accounts from '@reef-defi/extension-base/page/Accounts';
import SigningKey from '@reef-defi/extension-base/page/Signer';
import { InjectedAccount, ReefInjectedSigner, ReefSignerReqOptions, ReefSignerResponse, ReefSignerStatus, ReefVM, Unsubcall } from '@reef-defi/extension-inject/types';

import { ReefProvider } from './ReefProvider';

export class ReefSigner implements ReefInjectedSigner {
  private accounts: Accounts;
  private readonly extSigningKey: SigningKey;
  private injectedProvider: ReefProvider;
  private selectedProvider: Provider | undefined;
  private selectedSignerAccount: InjectedAccount | undefined;
  private selectedSignerStatus: ReefSignerResponse|null = null;
  private isGetSignerMethodSubscribed = false;
  private resolvesList: any[] = [];
  private isSelectedAccountReceived = false;

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

  public subscribeSelectedSigner (cb: (reefSigner: ReefSignerResponse) => unknown, options: ReefSignerReqOptions = {}): Unsubcall {
    const connectedVM = options.connectedVM || ReefVM.EVM;

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
      this.isSelectedAccountReceived = true;

      if (!account || account?.address !== this.selectedSignerAccount?.address) {
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

  public async getSelectedSigner (options: ReefSignerReqOptions = {}): Promise<ReefSignerResponse> {
    if (this.selectedSignerStatus) {
      return Promise.resolve({ ...this.selectedSignerStatus });
    }

    // when multiple initial calls are made save them to list and respond when ready
    const retPromise = new Promise<ReefSignerResponse>((resolve) => {
      this.resolvesList.push(resolve);
    });

    if (!this.isGetSignerMethodSubscribed) {
      this.isGetSignerMethodSubscribed = true;
      this.subscribeSelectedSigner((sig) => {
        if (!this.resolvesList.length) {
          return;
        }

        if (sig.status !== ReefSignerStatus.CONNECTING) {
          this.selectedSignerStatus = sig;
          this.resolvesList.forEach((resolve) => resolve({ ...sig }));
          this.resolvesList = [];
        }
      }, options);
    }

    return retPromise;
  }

  private async onSelectedSignerParamUpdate (cb: (reefSigner: ReefSignerResponse) => unknown, connectedVM: ReefVM): Promise<void> {
    const selectedSigner = ReefSigner.createReefSigner(this.selectedSignerAccount, this.selectedProvider, this.extSigningKey);
    const hasVM = await ReefSigner.hasConnectedVM(connectedVM, selectedSigner);
    const responseStatus = this.getResponseStatus(selectedSigner, hasVM, connectedVM);

    if (responseStatus.status !== ReefSignerStatus.CONNECTING) {
      cb(responseStatus);
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
      if (this.isSelectedAccountReceived && !this.selectedSignerAccount) {
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

    return !connectedVM || (connectedVM === ReefVM.EVM && signer && await signer.isClaimed());
  }
}
