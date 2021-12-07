import {AccountJson} from "@reef-defi/extension-base/background/types";
import {Provider} from "@reef-defi/evm-provider";
import {useGetReefSigner} from "./useGetSigner";

export const useLoadAppPools = (provider: Provider): void =>{
    const signer = useGetReefSigner();
    const { tokens } = useAppSelector((state) => state.tokens);
    const { reloadToggle } = useAppSelector((state) => state.pools);

    useAsyncEffect(async () => {
      if (!signer) { return; }

      await Promise.resolve()
        .then(() => dispatch(setPoolsLoading(true)))
        .then(() => loadPools(tokens, signer.signer, currentNetwork.factoryAddress))
        .then((pools) => dispatch(setPools(pools)))
        .catch((error) => console.error('load pools err=', error))
        .finally(() => dispatch(setPoolsLoading(false)));
    }, [reloadToggle]);
  };
