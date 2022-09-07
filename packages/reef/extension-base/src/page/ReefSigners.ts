import { Provider, Signer as ReefEVMSigner } from '@reef-defi/evm-provider';
import Accounts from '@reef-defi/extension-base/page/Accounts';
import Signer from '@reef-defi/extension-base/page/Signer';
import { InjectedAccount, Unsubcall } from '@reef-defi/extension-inject/types';
import { utils } from '@reef-defi/react-lib';

import { subscribeNetwork } from '../../../extension-ui/messaging';

export class ReefSigners {
  private accounts: Accounts;
  private extSigner: Signer;
  private selectedSignerProvider: { rpcUrl: string; provider: Provider; } | undefined;
  private selectedSignerAccount: InjectedAccount | undefined;

  constructor (accounts: Accounts, extSigner: Signer) {
    this.accounts = accounts;
    this.extSigner = extSigner;
  }

  public subscribeSelectedAccount (cb: (accounts: InjectedAccount | undefined) => unknown): Unsubcall {
    this.accounts.subscribe((accounts) => {
      cb(accounts.find((a) => a.isSelected));
    });

    return (): void => {
      // FIXME we need the ability to unsubscribe
    };
  }

  public subscribeSelectedAccountSigner (cb: (reefEVMSigner: ReefEVMSigner | undefined) => unknown): Unsubcall {
    this.subscribeSelectedNetworkProvider(() => {
      this.onSelectedSignerParamUpdate(cb);
    });
    this.subscribeSelectedAccount((account) => {
      if (account?.address !== this.selectedSignerAccount?.address) {
        this.selectedSignerAccount = account;
        this.onSelectedSignerParamUpdate(cb);
      }
    });

    return (): void => {
      // FIXME we need the ability to unsubscribe
    };
  }

  private subscribeSelectedNetworkProvider (cb: (provider: Provider) => void): void {
    subscribeNetwork(async (rpcUrl) => {
      if (this.selectedSignerProvider?.rpcUrl !== rpcUrl) {
        this.selectedSignerProvider?.provider.api.disconnect().catch((reason) => console.log('Error disconnecting api', reason));

        const provider = await utils.initProvider(rpcUrl);

        this.selectedSignerProvider = {
          rpcUrl,
          provider
        };
      }

      cb(this.selectedSignerProvider.provider);
    }).catch((reason) => console.log('Error subscribing network', reason));
  }

  private onSelectedSignerParamUpdate (cb: (accounts: (ReefEVMSigner | undefined)) => unknown) {
    if (this.selectedSignerAccount && this.selectedSignerProvider?.provider && this.extSigner) {
      cb(new ReefEVMSigner(this.selectedSignerProvider.provider, this.selectedSignerAccount.address, this.extSigner));
    }
  }
}
