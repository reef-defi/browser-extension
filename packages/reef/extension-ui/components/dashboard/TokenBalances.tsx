import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { Components, TokenWithAmount, utils } from '@reef-defi/react-lib';
import React from 'react';

import { Button, UikText } from './../../uik';
import { TokenPill } from './TokenPill';

const { DataProgress, getData, isDataSet } = utils;

const { Loading } = Components.Loading;

interface TokenBalances {
  tokens: utils.DataWithProgress<TokenWithAmount[]>;
  onRefresh: any;
}

export const TokenBalances = ({ isRefreshing, onRefresh, tokens }: TokenBalances): JSX.Element => (
  <div className='token-balances'>
    <div className='token-balances__head'>
      <UikText
        text='Tokens'
        type='title'
      />
      <Button
        icon={faSyncAlt}
        loader='fish'
        loading={isRefreshing}
        onClick={onRefresh}
        size='small'
        text='Refresh'
      />

    </div>

    <div className='token-balances__tokens'>
      {(!isDataSet(tokens) && tokens === DataProgress.LOADING) && (
        <div className='mt-5'>
          <Loading />
        </div>
      )}
      {!!isDataSet(tokens) && (
        getData(tokens)?.map((token) => (
          <TokenPill
            key={token.address}
            token={token}
          />
        ))
      )}
      {(
        (!!isDataSet(tokens) && !getData(tokens)?.length) ||
          (!isDataSet(tokens) && tokens === DataProgress.NO_DATA)
      ) &&
      (
        <div>No tokens to display.</div>
      )}
    </div>
  </div>
);
