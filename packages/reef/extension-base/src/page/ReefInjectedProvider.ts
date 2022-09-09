import {Unsubcall} from "@reef-defi/extension-inject/types";
import {utils} from "@reef-defi/react-lib";
import {Provider} from "@reef-defi/evm-provider";
import {SendRequest} from "@reef-defi/extension-base/page/types";

type ProviderRpc = { rpcUrl: string; provider: Provider; };

type ProviderCb = (provider: Provider) => void;

export class ReefInjectedProvider {

    private readonly sendRequest: SendRequest;

    private selectedNetworkProvider: ProviderRpc | undefined;

    private creatingNewProviderRpcUrl: string | null = null;

    private providerCbArr: ProviderCb[] = [];

    constructor(_sendRequest: SendRequest) {
        this.sendRequest = _sendRequest;

        this.subscribeSelectedNetwork((async (rpcUrl) => {
                console.log("GOT NETWORK SUBS=", rpcUrl);
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
                    this.providerCbArr.forEach(cb => cb(this.selectedNetworkProvider!.provider));
                    this.creatingNewProviderRpcUrl = null;
                }
            })
        );

    }

    async subscribeSelectedNetwork(cb: (rpcUrl: string) => void) {
        return this.sendRequest('pub(network.subscribe)', null, cb);
    }

    subscribeSelectedNetworkProvider(cb: ProviderCb): Unsubcall {
        this.providerCbArr.push(cb);
        if (!this.creatingNewProviderRpcUrl && this.selectedNetworkProvider) {
            cb(this.selectedNetworkProvider.provider);
        }

        return (): void => {
            // FIXME we need the ability to unsubscribe
        };
    }


}
