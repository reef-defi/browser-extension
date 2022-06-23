import React, {useMemo} from 'react';
import {appState, hooks, ReefSigner} from "@reef-defi/react-lib";
import {PoolContext, TokenContext, TokenPricesContext} from "@reef-defi/extension-ui/components";

export const ReefContext = (props:{children?: any; apollo: any, signer: ReefSigner}): JSX.Element => {
  const reefPrice = hooks.useObservableState(appState.reefPrice$);
  const tokens = hooks.useAllTokens(props.signer?.address, props.apollo);
  const pools = hooks.useAllPools();
  const tokenPrices = useMemo(
    () => hooks.estimatePrice(tokens, pools, reefPrice || 0),
    [tokens, pools, reefPrice]
  );

  return (<>
    <TokenContext.Provider value={tokens}>
      <PoolContext.Provider value={pools}>
        <TokenPricesContext.Provider value={tokenPrices}>
          {props.children}
        </TokenPricesContext.Provider>
      </PoolContext.Provider>
    </TokenContext.Provider>
  </>);
}
