import { Provider, Signer as ReefEVMSigner } from '@reef-defi/evm-provider';
import Accounts from '@reef-defi/extension-base/page/Accounts';
import Signer from '@reef-defi/extension-base/page/Signer';
import { InjectedAccount, Unsubcall } from '@reef-defi/extension-inject/types';

import { ReefInjectedProvider } from './ReefInjectedProvider';

export class ReefInjectedSigner {
  private accounts: Accounts;
  private extSigner: Signer;
  private network: ReefInjectedProvider;
  private selectedProvider: Provider | undefined;
  private selectedSignerAccount: InjectedAccount | undefined;

  constructor (accounts: Accounts, extSigner: Signer, network: ReefInjectedProvider) {
    this.accounts = accounts;
    this.extSigner = extSigner;
    this.network = network;
  }

  public subscribeSelectedAccount (cb: (accounts: InjectedAccount | undefined) => unknown): Unsubcall {
    return  this.accounts.subscribe((accounts) => {
      cb(accounts.find((a) => a.isSelected));
    });
  }

  public subscribeSelectedAccountSigner (cb: (reefEVMSigner: ReefEVMSigner | undefined) => unknown): Unsubcall {
    const unsubProvFn = this.network.subscribeSelectedNetworkProvider((provider) => {
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

  private onSelectedSignerParamUpdate (cb: (accounts: (ReefEVMSigner | undefined)) => unknown) {
    if (this.selectedProvider && this.extSigner) {
      const reefEVMSigner = this.selectedSignerAccount ? new ReefEVMSigner(this.selectedProvider, this.selectedSignerAccount.address, this.extSigner):undefined;
      cb(reefEVMSigner);
    }
  }
}
