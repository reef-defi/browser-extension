import {sendMessage, subscribeAccounts} from "@reef-defi/extension-ui/messaging";
import {AccountJson} from "@reef-defi/extension-base/background/types";

export async function selectAccount(address: string): Promise<boolean> {
    return sendMessage('pri(accounts.select)', {address});
}

export async function subscribeSelectedAccount(cb: (selected: AccountJson | undefined) => void): Promise<boolean> {
    return subscribeAccounts(accounts => {
        cb(accounts.find(a => a.isSelected));
    });
}
