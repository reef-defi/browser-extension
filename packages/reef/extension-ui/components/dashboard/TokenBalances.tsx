import { TokenWithAmount, utils } from '@reef-defi/react-lib';
import React from 'react';

import { Loading, UikText } from './../../uik';
import { TokenPill } from './TokenPill';

const { DataProgress, getData, isDataSet } = utils;

interface TokenBalances {
  tokens: utils.DataWithProgress<TokenWithAmount[]>;
}

export const TokenBalances = ({ tokens }: TokenBalances): JSX.Element => (
  <div className='token-balances'>
    <div className='token-balances__head'>
      <UikText
        text='Tokens'
        type='title'
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
        <UikText>No tokens to display.</UikText>
      )}
    </div>
  </div>
);
