import {appState, hooks, ReefSigner} from '@reef-defi/react-lib';
import React, {useEffect, useState} from 'react';
import {EvmBindComponent} from './EvmBindComponent';
import {SigningOrChildren} from './SigningOrChildren';

/*const onTxUpdate = (state: utils.TxStatusUpdate) => {
  let updateActions: UpdateAction[] = [];

  if (state.componentTxType === EvmBindComponentTxType.BIND) {
    // bind
    if (state.addresses && state.addresses.length) {
      state.addresses.forEach((address) => {
        updateActions.push({
          type: UpdateDataType.ACCOUNT_EVM_BINDING,
          address
        } as UpdateAction);
        updateActions.push({
          type: UpdateDataType.ACCOUNT_NATIVE_BALANCE,
          address
        } as UpdateAction);
      });
    } else {
      updateActions = [{ type: UpdateDataType.ACCOUNT_EVM_BINDING }, { type: UpdateDataType.ACCOUNT_NATIVE_BALANCE }];
    }
  } else {
    // transaction
    updateActions = state.addresses && state.addresses.length
      ? state.addresses.map((address) => ({
        type: UpdateDataType.ACCOUNT_NATIVE_BALANCE,
        address
      } as UpdateAction))
      : [{ type: UpdateDataType.ACCOUNT_NATIVE_BALANCE }];
  }

  onTxUpdateReloadSignerBalances(state, updateActions);
};*/

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
        <EvmBindComponent
          bindSigner={bindSigner}
          signers={accounts}
        ></EvmBindComponent></div>)}
    </SigningOrChildren>
  );
};
