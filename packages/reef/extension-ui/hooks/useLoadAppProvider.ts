import { hooks } from '@reef-defi/react-lib';
import { useEffect } from 'react';
import { currentNetwork } from '../environment';
import {appProvider$} from "../model/appState";

export const useLoadAppProvider = (): void => {
  const [provider, isProviderLoading] = hooks.useProvider(currentNetwork.rpcUrl);
  // const dispatch = useAppDispatch();

  useEffect(() => {
    if (provider) {
      // dispatch(setProvider(provider));
      appProvider$.next(provider);
    }
    return () => {
      // appProvider$.next(null);
      provider?.api.disconnect();
    };
  }, [provider]);

  useEffect(() => {
    // dispatch(setProviderLoading(isProviderLoading));
  }, [isProviderLoading]);
};
