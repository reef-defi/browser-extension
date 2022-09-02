import {sendMessage} from "@reef-defi/extension-ui/messaging";

export async function selectAccount (address: string): Promise<boolean> {
    return sendMessage('pri(accounts.select)', { address });
}
