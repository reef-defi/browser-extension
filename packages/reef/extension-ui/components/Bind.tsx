import {appState, hooks, ReefSigner, Components} from '@reef-defi/react-lib';
import React, {useEffect, useState} from 'react';
import {SigningOrChildren} from './SigningOrChildren';
import {TxStatusUpdate} from "@reef-defi/react-lib/dist/utils";

const onTxUpdate = (state: TxStatusUpdate) => {
  let updateActions: appState.UpdateAction[] = [];

  if (state.componentTxType === Components.EvmBindComponentTxType.BIND) {
    // bind
    if (state.addresses && state.addresses.length) {
      state.addresses.forEach((address) => {
        updateActions.push({
          type: appState.UpdateDataType.ACCOUNT_EVM_BINDING,
          address
        } as appState.UpdateAction);
        updateActions.push({
          type: appState.UpdateDataType.ACCOUNT_NATIVE_BALANCE,
          address
        } as appState.UpdateAction);
      });
    } else {
      updateActions = [{ type: appState.UpdateDataType.ACCOUNT_EVM_BINDING }, { type: appState.UpdateDataType.ACCOUNT_NATIVE_BALANCE }];
    }
  } else {
    // transaction
    updateActions = state.addresses && state.addresses.length
      ? state.addresses.map((address) => ({
        type: appState.UpdateDataType.ACCOUNT_NATIVE_BALANCE,
        address
      } as appState.UpdateAction))
      : [{ type: appState.UpdateDataType.ACCOUNT_NATIVE_BALANCE }];
  }

  appState.onTxUpdateResetSigners(state, updateActions);
};

export const Bind = (): JSX.Element => {
  const accounts: ReefSigner[] | undefined = hooks.useObservableState(appState.signers$);
  const selectedSigner: ReefSigner | undefined = hooks.useObservableState(appState.selectedSigner$);
  const [bindSigner, setBindSigner] = useState<ReefSigner>();
  const theme = localStorage.getItem('theme');

  useEffect(() => {
    const [, params] = window.location.href.split('?');
    const urlParams = params?.split('&').map((e) => e.split('=').map(decodeURIComponent)).reduce((r: any, [k, v]) => (r[k] = v, r), {});
    const { bindAddress } = urlParams || {};
    let paramAccount;

    if (bindAddress) {
      paramAccount = accounts?.find((acc) => acc.address === bindAddress);
    }

    setBindSigner(paramAccount || selectedSigner);
  }, [selectedSigner]);

  return (
    <SigningOrChildren>
      {bindSigner && accounts && (<div className={theme === 'dark' ? 'theme-dark' : ''}>
        <Components.EvmBindComponent
          bindSigner={bindSigner}
          onTxUpdate={onTxUpdate}
          signers={accounts}
        ></Components.EvmBindComponent></div>)}
    </SigningOrChildren>
  );
};
