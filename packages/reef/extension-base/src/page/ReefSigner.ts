import { Provider, Signer as ReefEVMSigner } from '@reef-defi/evm-provider';
import Accounts from '@reef-defi/extension-base/page/Accounts';
import Signer from '@reef-defi/extension-base/page/Signer';
import { InjectedAccount, ReefInjectedSigner, Unsubcall } from '@reef-defi/extension-inject/types';

import { ReefProvider } from './ReefProvider';

export class ReefSigner implements ReefInjectedSigner {
  private accounts: Accounts;
  private extSigner: Signer;
  private injectedProvider: ReefProvider;
  private selectedProvider: Provider | undefined;
  private selectedSignerAccount: InjectedAccount | undefined;
  private selectedSigner: Signer | undefined;

  constructor (accounts: Accounts, extSigner: Signer, injectedProvider: ReefProvider) {
    this.accounts = accounts;
    this.extSigner = extSigner;
    this.injectedProvider = injectedProvider;
  }

  public subscribeSelectedAccount (cb: (accounts: InjectedAccount | undefined) => unknown): Unsubcall {
    return this.accounts.subscribe((accounts) => {
      cb(accounts.find((a) => a.isSelected));
    });
  }

  public subscribeSelectedAccountSigner (cb: (reefEVMSigner: ReefEVMSigner | undefined) => unknown): Unsubcall {
    const unsubProvFn = this.injectedProvider.subscribeSelectedNetworkProvider((provider) => {
      this.selectedProvider = provider;
      this.onSelectedSignerParamUpdate(cb);
    });
    const unsubAccFn = this.subscribeSelectedAccount((account) => {
      if (account?.address !== this.selectedSignerAccount?.address) {
        this.selectedSignerAccount = account;
        this.onSelectedSignerParamUpdate(cb);
      }
    });

    return (): void => {
      unsubProvFn();
      unsubAccFn();
    };
  }

  public getSelectedSigner (): Signer | undefined {
    return this.selectedSigner;
  }

  private onSelectedSignerParamUpdate (cb: (accounts: (ReefEVMSigner | undefined)) => unknown) {
    if (this.selectedProvider && this.extSigner) {
      const reefEVMSigner = this.selectedSignerAccount ? new ReefEVMSigner(this.selectedProvider, this.selectedSignerAccount.address, this.extSigner) : undefined;

      cb(reefEVMSigner);
    }
  }
}
