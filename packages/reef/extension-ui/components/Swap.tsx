import {Components} from "@reef-defi/react-lib";
import {useObservableState} from "../hooks/useObservableState";
import {selectedSigner$} from "../state/accountState";
import {selectedNetwork$} from "../state/providerState";
import {allAvailableSignerTokens$} from "../state/tokenState";
import React from "react";
import {onTxUpdateReloadSignerBalances} from "../state/util";
import {SigningOrChildren} from "./SigningOrChildren";
import {TxStatusUpdate} from "@reef-defi/react-lib/dist/utils";
import {createUpdateActions, UpdateAction, UpdateDataType} from "../state/updateCtxUtil";

export const Swap = (): JSX.Element => {
  const signer = useObservableState(selectedSigner$);
  const network = useObservableState(selectedNetwork$);
  const availableTokens = useObservableState(allAvailableSignerTokens$);
  const theme = localStorage.getItem('theme');
  const onSwapTxUpdate = (txState: TxStatusUpdate) => {
    const updateTypes = [UpdateDataType.ACCOUNT_NATIVE_BALANCE, UpdateDataType.ACCOUNT_TOKENS];
    const updateActions: UpdateAction[] = createUpdateActions(updateTypes, txState.addresses);
    onTxUpdateReloadSignerBalances(txState, updateActions);
  };

  return (
    <SigningOrChildren>
      {!!signer && !!network && !!availableTokens && !!availableTokens.length &&
      <div className={theme === 'dark' ? 'theme-dark' : ''}>
        <Components.SwapComponent account={signer} network={network} tokens={availableTokens}
                                  onTxUpdate={onSwapTxUpdate}></Components.SwapComponent></div>}
    </SigningOrChildren>
  );
}
