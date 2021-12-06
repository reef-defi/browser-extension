import {AccountJson} from "@reef-defi/extension-base/background/types";

export const useGetReefSigner = (selectedAccount: AccountJson): AccountJson =>{
 /* const [signer] = useState();
  useMemo(() => {
    // rpc.accountToSigner(,)
  }, [selectedAccount]);
  return signer;*/
  return selectedAccount;
}
