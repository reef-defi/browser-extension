import {Components, hooks as reefHooks, Pool, TokenWithAmount, utils as reefUtils,} from '@reef-defi/react-lib';
import React, {useContext, useEffect, useState} from 'react';
import {currentNetwork} from '../environment';
import {useSharedState} from "../hooks/useSharedState";
import {appPools$, appProvider$} from "../service/appState";
import {AccountContext} from "@reef-defi/extension-ui/components";
import {useGetReefSigner, useGetSigner} from "../hooks/useGetSigner";

const {
  isDataSet,
  getData,
  DataProgress,
} = reefUtils;

const { useLoadSignerTokens, useReefPriceInterval, useSignerTokenBalances } = reefHooks;
const {
  Loading, TransferComponent, TX_TYPE_EVM,
} = Components;

export const Transfer = (): JSX.Element => {
  const [ provider] = useSharedState(appProvider$);
  const [pools] = useSharedState<Pool[]>(appPools$);
  const {accounts, selectedAccount} = useContext(AccountContext);
  ...
  const selectedSigner = useGetReefSigner(selectedAccount);
  const signerTokens = useLoadSignerTokens(false, currentNetwork, selectedSigner);
  const reefPrice = useReefPriceInterval(60000);
  const signerTokenBalances = useSignerTokenBalances(signerTokens, pools, reefPrice);
  const [token, setToken] = useState<reefUtils.DataWithProgress<TokenWithAmount>>(DataProgress.LOADING);

  useEffect(() => {
    if (isDataSet(signerTokenBalances)) {
      const sigTokens = getData(signerTokenBalances);
      if (!sigTokens?.length) {
        setToken(DataProgress.NO_DATA);
        return;
      }
      const signerTokenBalance = sigTokens ? sigTokens[0] : undefined;
      if (signerTokenBalance && isDataSet(signerTokenBalance.balanceValue)) {
        const tkn = { ...signerTokenBalance, amount: '', isEmpty: false } as TokenWithAmount;
        setToken(tkn);
        return;
      }
      if (!isDataSet(signerTokenBalance?.balanceValue) && isDataSet(signerTokens)) {
        const sTkns = getData(signerTokens);
        const sToken = sTkns ? sTkns[0] : undefined;
        if (sToken) {
          const tkn = { ...sToken, amount: '', isEmpty: false } as TokenWithAmount;
          setToken(tkn);
        }
        return;
      }
      setToken(signerTokenBalance?.balanceValue as reefUtils.DataProgress);
      return;
    }
    setToken(signerTokenBalances as reefUtils.DataProgress);
  }, [signerTokenBalances, signerTokens]);

  const onTxUpdate = (txUpdateData: Components.TxStatusUpdate): void => {
    if (txUpdateData?.isInBlock || txUpdateData?.error) {
      const delay = txUpdateData.type === TX_TYPE_EVM ? 2000 : 0;
      setTimeout(() => dispatch(reloadTokens()), delay);
    }
  };

  return (
    <>
      {!isDataSet(token) && token === DataProgress.LOADING && <Loading.Loading />}
      {!isDataSet(token) && token === DataProgress.NO_DATA && <div>No tokens for transaction.</div>}
      { provider && isDataSet(token) && isDataSet(signerTokenBalances) && selectedSigner
          && <TransferComponent tokens={signerTokenBalances as reefHooks.TokenWithPrice[]} from={selectedSigner} token={token as TokenWithAmount} provider={provider} accounts={accounts} currentAccount={selectedSigner} onTxUpdate={onTxUpdate} />}
    </>
  );
};
