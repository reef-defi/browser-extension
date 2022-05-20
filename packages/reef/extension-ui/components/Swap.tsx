import { appState, Components, createEmptyTokenWithAmount, hooks, Network, ReefSigner, reefTokenWithAmount, Token } from '@reef-defi/react-lib';
import React from 'react';

import { Loading } from '../uik';
import { SigningOrChildren } from './SigningOrChildren';

const REEF = reefTokenWithAmount();
const NO_TKN = createEmptyTokenWithAmount();

export const Swap = (): JSX.Element => {
  const signer: ReefSigner | undefined = hooks.useObservableState(appState.selectedSigner$);
  const network: Network | undefined = hooks.useObservableState(appState.currentNetwork$);
  const availableTokens: Token[] | undefined = hooks.useObservableState(appState.allAvailableSignerTokens$);
  const theme = localStorage.getItem('theme');

  return (
    <SigningOrChildren>
      {!availableTokens && <Loading />}
      {!!signer && !!network && !!availableTokens && !!availableTokens.length &&
      <div className={theme === 'dark' ? 'theme-dark' : ''}>
        <Components.SwapComponent
          account={signer}
          buyToken={NO_TKN}
          network={network}
          sellToken={REEF}
          tokens={availableTokens}
        ></Components.SwapComponent></div>}
    </SigningOrChildren>
  );
};
