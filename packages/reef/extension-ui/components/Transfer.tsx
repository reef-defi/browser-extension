import React, {useContext, useEffect, useState} from 'react';
import {appState} from "../state";
import {TokenWithAmount, utils as reefUtils} from "@reef-defi/react-lib";
import {useObservableState} from "../hooks/useObservableState";
import {Components} from "@reef-defi/react-lib/";
import Signing from "@reef-defi/extension-ui/Popup/Signing";
import {SigningReqContext} from "@reef-defi/extension-ui/components";
import {reloadSignersBalanceSubject} from "../state/accountState";

const onTxUpdate = (txUpdateData: Components.TxStatusUpdate): void => {
  console.log("TUUUUU=",txUpdateData);
  if (txUpdateData?.isInBlock || txUpdateData?.error) {
    const delay = txUpdateData.type === Components.TX_TYPE_EVM ? 2000 : 0;
    setTimeout(() => reloadSignersBalanceSubject.next(), delay);
  }
};

export const Transfer = (): JSX.Element => {
  const provider = useObservableState(appState.provider$);
  const accounts = useObservableState(appState.signers$);
  // const pools = useObservableState(appState.pools$);
  const selectedSigner = useObservableState(appState.selectedSigner$);
  const signerTokenBalances = useObservableState(appState.selectedSignerTokenBalances$);
  // const reefPrice = useObservableState(appState.reefPrice$);

  const [token, setToken] = useState<reefUtils.DataWithProgress<TokenWithAmount>>(reefUtils.DataProgress.LOADING);
  const signRequests = useContext(SigningReqContext);

  useEffect(() => {
    if (reefUtils.isDataSet(signerTokenBalances)) {
      const sigTokens = reefUtils.getData(signerTokenBalances);
      if (!sigTokens?.length) {
        setToken(reefUtils.DataProgress.NO_DATA);
        return;
      }
      const signerTokenBalance = sigTokens ? sigTokens[0] : undefined;
      if (signerTokenBalance /*&& reefUtils.isDataSet(signerTokenBalance.balanceValue)*/) {
        const tkn = {...signerTokenBalance, amount: '', isEmpty: false} as TokenWithAmount;
        setToken(tkn);
        return;
      }
      /*if (!isDataSet(signerTokenBalance?.balanceValue) && isDataSet(signerTokens)) {
        const sTkns = getData(signerTokens);
        const sToken = sTkns ? sTkns[0] : undefined;
        if (sToken) {
          const tkn = { ...sToken, amount: '', isEmpty: false } as TokenWithAmount;
          setToken(tkn);
        }
        return;
      }*/
      // setToken(signerTokenBalance?.balanceValue as reefUtils.DataProgress);
      return;
    }
    // setToken(signerTokenBalances as reefUtils.DataProgress);
    // }, [signerTokenBalances, signerTokens]);
  }, [signerTokenBalances]);

  return (
    <>
      {
      <div className={(signRequests && signRequests.length) ? 'd-none' : undefined}>
        {!reefUtils.isDataSet(token) && token === reefUtils.DataProgress.LOADING && <Components.Loading.Loading/>}
        {!reefUtils.isDataSet(token) && token === reefUtils.DataProgress.NO_DATA &&
        <div>No tokens for transaction.</div>}
        {provider && reefUtils.isDataSet(token) && signerTokenBalances && reefUtils.isDataSet(signerTokenBalances) && selectedSigner && accounts
        && <Components.TransferComponent tokens={signerTokenBalances} from={selectedSigner}
                                         token={token as TokenWithAmount} provider={provider} accounts={accounts}
                                         currentAccount={selectedSigner} onTxUpdate={(val)=>{
          console.log("EXT Transfer comp onTx=",val);onTxUpdate(val)}}/>
        }
      </div>
      }
      {(!!signRequests && !!signRequests.length) && <Signing/>}
    </>
  );
};
