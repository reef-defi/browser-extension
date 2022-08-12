import { SigningReqContext } from '@reef-defi/extension-ui/components';
import { useTranslation } from '@reef-defi/extension-ui/components/translate';
import { Header } from '@reef-defi/extension-ui/partials';
import { appState, Components, hooks, ReefSigner } from '@reef-defi/react-lib';
import { TxStatusUpdate } from '@reef-defi/react-lib/dist/utils';
import React, { useContext, useEffect, useState } from 'react';

import { SigningOrChildren } from './SigningOrChildren';

const onTxUpdate = (state: TxStatusUpdate) => {
  let updateActions: appState.UpdateAction[] = [];

  if (state.componentTxType === Components.EvmBindComponentTxType.BIND) {
    // bind
    if (state.addresses && state.addresses.length) {
      state.addresses.forEach((address) => {
        updateActions.push({
          address,
          type: appState.UpdateDataType.ACCOUNT_EVM_BINDING
        } as appState.UpdateAction);
        updateActions.push({
          address,
          type: appState.UpdateDataType.ACCOUNT_NATIVE_BALANCE
        } as appState.UpdateAction);
      });
    } else {
      updateActions = [{ type: appState.UpdateDataType.ACCOUNT_EVM_BINDING }, { type: appState.UpdateDataType.ACCOUNT_NATIVE_BALANCE }];
    }
  } else {
    // transaction
    updateActions = state.addresses && state.addresses.length
      ? state.addresses.map((address) => ({
        address,
        type: appState.UpdateDataType.ACCOUNT_NATIVE_BALANCE
      } as appState.UpdateAction))
      : [{ type: appState.UpdateDataType.ACCOUNT_NATIVE_BALANCE }];
  }

  appState.onTxUpdateResetSigners(state, updateActions);
};

export const Bind = (): JSX.Element => {
  const { t } = useTranslation();
  const accounts: ReefSigner[] | undefined | null = hooks.useObservableState(appState.signers$);
  const selectedSigner: ReefSigner | undefined | null = hooks.useObservableState(appState.selectedSigner$);
  const [bindSigner, setBindSigner] = useState<ReefSigner>();
  const theme = localStorage.getItem('theme');
  const requests = useContext(SigningReqContext);
  const hasSignRequests = requests.length > 0;

  useEffect(() => {
    const [, params] = window.location.href.split('?');
    const urlParams = params?.split('&').map((e) => e.split('=').map(decodeURIComponent)).reduce((r: any, [k, v]) => {
      r[k] = v;

      return r;
    }, {});
    const { bindAddress } = urlParams || {};
    let paramAccount;

    if (bindAddress) {
      paramAccount = accounts?.find((acc) => acc.address === bindAddress);
    }

    setBindSigner(paramAccount || selectedSigner || undefined);
  }, [accounts, selectedSigner]);

  return (
    <>
      {!hasSignRequests && (<Header
        showBackArrow
        text={t<string>('Bind EVM')}
      />)
      }
      <SigningOrChildren>
        {bindSigner && accounts && (<div className={theme === 'dark' ? 'theme-dark' : ''}>
          <Components.EvmBindComponent
            bindSigner={bindSigner}
            onTxUpdate={onTxUpdate}
            signers={accounts}
          ></Components.EvmBindComponent></div>)}
      </SigningOrChildren>
    </>
  );
};
