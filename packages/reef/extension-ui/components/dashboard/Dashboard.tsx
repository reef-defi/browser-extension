import { utils } from '@reef-defi/react-lib';
import React from 'react';

import { useObservableState } from '../../hooks/useObservableState';
import { tokenPrices$ } from '../../state/tokenState';
import { TokenBalances } from './TokenBalances';

export const Dashboard = (): JSX.Element => {
  const tokensWithPrice = useObservableState(tokenPrices$);

  return (<>
    <TokenBalances
      isRefreshing={false}
      tokens={tokensWithPrice || utils.DataProgress.LOADING}
    ></TokenBalances>
  </>);
};
