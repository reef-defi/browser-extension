import React, {useEffect, useState} from 'react';
import {appState, hooks, ReefSigner, TokenWithAmount, utils as reefUtils} from "@reef-defi/react-lib";
import {Components} from "@reef-defi/react-lib/";
import {SigningOrChildren} from "./SigningOrChildren";
import {Provider} from "@reef-defi/evm-provider";

export const Transfer = (): JSX.Element => {
  const provider: Provider | undefined = hooks.useObservableState(appState.providerSubj);
  const accounts: ReefSigner[] | undefined = hooks.useObservableState(appState.signers$);
  const selectedSigner: ReefSigner | undefined = hooks.useObservableState(appState.selectedSigner$);
  const signerTokenBalances: TokenWithAmount[] | undefined = hooks.useObservableState(appState.tokenPrices$);
  const theme = localStorage.getItem('theme');

  const [token, setToken] = useState<reefUtils.DataWithProgress<TokenWithAmount>>(reefUtils.DataProgress.LOADING);

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

      /* if (!isDataSet(signerTokenBalance?.balanceValue) && isDataSet(signerTokens)) {
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
    <SigningOrChildren>
      {!reefUtils.isDataSet(token) && token === reefUtils.DataProgress.LOADING && <Components.Loading.Loading/>}
      {!reefUtils.isDataSet(token) && token === reefUtils.DataProgress.NO_DATA &&
      <div>No tokens for transaction.</div>}
      {provider && reefUtils.isDataSet(token) && signerTokenBalances && reefUtils.isDataSet(signerTokenBalances) && selectedSigner && accounts
      && <div className={theme === 'dark' ? 'theme-dark' : ''}>
        <Components.TransferComponent tokens={signerTokenBalances} from={selectedSigner}
                                      token={token as TokenWithAmount} provider={provider} accounts={accounts}
                                      currentAccount={selectedSigner}
                                      />
      </div>
      }
    </SigningOrChildren>
  );
};
