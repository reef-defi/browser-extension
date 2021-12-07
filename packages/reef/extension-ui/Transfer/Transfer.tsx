import React from 'react';
import {useSubjectStateObserver} from "../hooks/useSubjectState";
import {reefPrice$} from "../model/appState";

// const {
//   DataProgress,
// } = reefUtils;

// const { useSignerTokenBalances } = reefHooks;

export const Transfer = (): JSX.Element => {
  // const [ provider] = useSubjectState(appProvider$);
  // const [pools] = useSubjectState<Pool[]>(appPools$);
  // const {accounts, selectedAccount} = useContext(AccountContext);
  // const selectedSigner = useGetReefSigner(selectedAccount);
  // const signerTokens = useSubjectState(appSignerTokens$);
  const reefPrice = useSubjectStateObserver(reefPrice$);
  // const signerTokenBalances = useSignerTokenBalances(signerTokens, pools, reefPrice);
  // const [token, setToken] = useState<reefUtils.DataWithProgress<TokenWithAmount>>(DataProgress.LOADING);

  /*useEffect(() => {
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
  };*/
  return (<>price={reefPrice}</>)
  /*return (
    <>
      {!isDataSet(token) && token === DataProgress.LOADING && <Loading.Loading />}
      {!isDataSet(token) && token === DataProgress.NO_DATA && <div>No tokens for transaction.</div>}
      { provider && isDataSet(token) && isDataSet(signerTokenBalances) && selectedSigner
          && <TransferComponent tokens={signerTokenBalances as reefHooks.TokenWithPrice[]} from={selectedSigner} token={token as TokenWithAmount} provider={provider} accounts={accounts} currentAccount={selectedSigner} onTxUpdate={onTxUpdate} />}
    </>
  );*/
};
