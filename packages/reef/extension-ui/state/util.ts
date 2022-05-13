import { Provider } from '@reef-defi/evm-provider';
import { AccountJson } from '@reef-defi/extension-base/background/types';
import Signer from '@reef-defi/extension-base/page/Signer';
import { InjectedAccountWithMeta } from '@reef-defi/extension-inject/types';
import { ReefSigner, rpc } from '@reef-defi/react-lib';

export function toReefSigner (acc: AccountJson, provider: Provider, injectionSigner: Signer): Promise<ReefSigner|undefined> {
  const accWithMeta: InjectedAccountWithMeta = {
    address: acc.address,
    meta: {
      genesisHash: acc.genesisHash,
      name: acc.name,
      source: acc.name || ''
    },
    type: acc.type
  };

  return rpc.metaAccountToSigner(accWithMeta, provider, injectionSigner);
}
