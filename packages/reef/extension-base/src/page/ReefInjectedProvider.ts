import { Provider } from '@reef-defi/evm-provider';
import { SendRequest } from '@reef-defi/extension-base/page/types';
import { Unsubcall } from '@reef-defi/extension-inject/types';
import { utils } from '@reef-defi/react-lib';

type ProviderRpc = { rpcUrl: string; provider: Provider; };

type ProviderCb = (provider: Provider) => void;

export class ReefInjectedProvider {
  private readonly sendRequest: SendRequest;

  private selectedNetworkProvider: ProviderRpc | undefined;

  private creatingNewProviderRpcUrl: string | null = null;

  private providerCbArr: { cb: ProviderCb, subsIdent: string }[] = [];

  constructor (_sendRequest: SendRequest) {
    this.sendRequest = _sendRequest;

    this.subscribeSelectedNetwork(async (rpcUrl) => {
      if (!this.providerCbArr.length) {
        return;
      }

      if (this.creatingNewProviderRpcUrl === rpcUrl) {
        return;
      }

      if (this.selectedNetworkProvider?.rpcUrl !== rpcUrl) {
        this.creatingNewProviderRpcUrl = rpcUrl;
        await this.selectedNetworkProvider?.provider.api.disconnect();

        const provider = await utils.initProvider(rpcUrl);

        this.selectedNetworkProvider = {
          rpcUrl,
          provider
        };
        this.providerCbArr?.forEach((cbObj) => this.selectedNetworkProvider ? cbObj.cb(this.selectedNetworkProvider.provider) : null);
        this.creatingNewProviderRpcUrl = null;
      }
    }
    ).catch((err) => console.log('Error subscribeSelectedNetwork ', err));
  }

  async subscribeSelectedNetwork (cb: (rpcUrl: string) => void) {
    return this.sendRequest('pub(network.subscribe)', null, cb);
  }

  subscribeSelectedNetworkProvider (cb: ProviderCb): Unsubcall {
    const subsIdent = (Math.random()).toString();

    this.providerCbArr.push({ cb, subsIdent: subsIdent });

    if (!this.creatingNewProviderRpcUrl && this.selectedNetworkProvider) {
      cb(this.selectedNetworkProvider.provider);
    }

    return (): void => {
      const removeIdx = this.providerCbArr.findIndex((cbObj) => cbObj.subsIdent === subsIdent);

      this.providerCbArr.splice(removeIdx, 1);
      this.disconnectProvider();
    };
  }

  private disconnectProvider () {
    if (!this.providerCbArr.length || !this.providerCbArr.some((e) => !!e)) {
      this.selectedNetworkProvider?.provider.api.disconnect().catch((err) => console.log('Error disconnecting provider', err));
      this.selectedNetworkProvider = undefined;
    }
  }
}
