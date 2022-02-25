import {utils, hooks, TokenWithAmount, appState} from '@reef-defi/react-lib';
import React from 'react';
import { TokenBalances } from './TokenBalances';

export const Dashboard = (): JSX.Element => {
  const tokensWithPrice: TokenWithAmount[]|undefined = hooks.useObservableState(appState.tokenPrices$);

  return (<>
    <TokenBalances
      tokens={tokensWithPrice || utils.DataProgress.LOADING}
    ></TokenBalances>
  </>);
};
