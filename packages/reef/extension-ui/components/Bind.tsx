import React, {useEffect, useState} from 'react';
import {SigningOrChildren} from "./SigningOrChildren";
import {EvmBindComponent, EvmBindComponentTxType} from "./EvmBindComponent";
import {useObservableState} from "../hooks/useObservableState";
import {appState} from "../state"
import {onTxUpdateReloadSignerBalances} from "../state/util";
import {ReefSigner, utils} from "@reef-defi/react-lib";
import {reloadSignerEvmBindingSubject} from "../state/accountState";

const onTxUpdate = (state: utils.TxStatusUpdate) => {
  if (state.isInBlock && !!state.address && state.componentTxType === EvmBindComponentTxType.BIND) {
    // TODO binding should also reload balance - one subject - {address:'da', updates: [UpdateEnum.BALANCE, UpdateEnum.EVM_ADDRESS]}[]
    reloadSignerEvmBindingSubject.next(state.address);
    onTxUpdateReloadSignerBalances(state);
  } else {
    onTxUpdateReloadSignerBalances(state);
  }
}

export const Bind = (): JSX.Element => {
  // const provider = useObservableState(appState.provider$);
  const accounts = useObservableState(appState.signers$);
  const selectedSigner = useObservableState(appState.selectedSigner$);
  const [bindSigner, setBindSigner] = useState<ReefSigner>();
  useEffect(() => {
    let [, params] = window.location.href.split('?');
    const urlParams = params?.split('&').map(e => e.split('=').map(decodeURIComponent)).reduce((r: any, [k, v]) => (r[k] = v, r), {});
    const {bindAddress} = urlParams||{};
    let paramAccount;
    if (bindAddress) {
      paramAccount = accounts?.find(acc => acc.address === bindAddress);
    }
    setBindSigner(paramAccount || selectedSigner);
  }, [selectedSigner]);


  //
  // const signRequests = useContext(SigningReqContext);

  return (
    <SigningOrChildren>
      {bindSigner && (<EvmBindComponent bindSigner={bindSigner} signers={accounts || []}
                                           onTxUpdate={onTxUpdate}></EvmBindComponent>)}
    </SigningOrChildren>
  );
};
