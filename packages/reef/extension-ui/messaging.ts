import { AccountJson } from '@reef-defi/extension-base/background/types';
import { sendMessage, subscribeAccounts } from '@reef-defi/extension-ui/messaging';

export async function selectAccount (address: string): Promise<boolean> {
  console.log('SSSSSS selectAccount=', address);

  return sendMessage('pri(accounts.select)', { address });
}

export async function subscribeSelectedAccount (cb: (selected: AccountJson | undefined) => void): Promise<boolean> {
  return subscribeAccounts((accounts) => {
    cb(accounts.find((a) => a.isSelected));
  });
}

export async function selectNetwork (rpcUrl: string): Promise<boolean> {
  return sendMessage('pri(network.select)', { rpcUrl });
}

export async function subscribeNetwork (cb: (rpcUrl: string) => void): Promise<boolean> {
  return sendMessage('pri(network.subscribe)', null, cb);
}
