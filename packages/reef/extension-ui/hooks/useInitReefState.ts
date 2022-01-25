import {hooks} from '@reef-defi/react-lib';
import {useEffect} from 'react';
import {useObservableState} from "./useObservableState";
import {AccountJson} from "@reef-defi/extension-base/background/types";
import {appState} from "../state";

export const useInitReefState = (accounts: AccountJson[]|null): void => {
  const network = useObservableState(appState.selectedNetworkSubj);
  const [provider, isProviderLoading] = hooks.useProvider(network?.rpcUrl);

  useEffect(() => {

    if (provider) {
      appState.providerSubj.next(provider);
    }
    return () => {
      provider?.api.disconnect();
    };
  }, [provider]);

  useEffect(() => {
    // dispatch(setProviderLoading(isProviderLoading));
  }, [isProviderLoading]);

  useEffect(() => {
    appState.accounts$.next(accounts||[]);
  }, [accounts]);

};
