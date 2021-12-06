import {sendMessage} from "@reef-defi/extension-ui/messaging";
import {AccountJson} from "@reef-defi/extension-base/background/types";


export async function selectAccount (account: AccountJson|null): Promise<boolean> {
  return sendMessage('pri(accounts.select)', { address: account?.address||'' });
}

export async function subscribeSelectedAccount (cb: (account: AccountJson|null) => void): Promise<boolean> {
  return sendMessage('pri(accounts.selected)', null, cb);
}
