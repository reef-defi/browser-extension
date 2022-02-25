import {appState, Components, hooks, Network, ReefSigner, Token} from "@reef-defi/react-lib";
import React from "react";
import {SigningOrChildren} from "./SigningOrChildren";

export const Swap = (): JSX.Element => {
  const signer: ReefSigner | undefined = hooks.useObservableState(appState.selectedSigner$);
  const network: Network | undefined = hooks.useObservableState(appState.selectedNetworkSubj);
  const availableTokens: Token[] | undefined = hooks.useObservableState(appState.allAvailableSignerTokens$);
  const theme = localStorage.getItem('theme');

  return (
    <SigningOrChildren>
      {!!signer && !!network && !!availableTokens && !!availableTokens.length &&
      <div className={theme === 'dark' ? 'theme-dark' : ''}>
        <Components.SwapComponent account={signer} network={network} tokens={availableTokens}
                                  ></Components.SwapComponent></div>}
    </SigningOrChildren>
  );
}
