import { TokenWithAmount, utils as reefUtils } from '@reef-defi/react-lib';
import React from 'react';

import { Card, UikText } from './../../uik';

const { isDataSet } = reefUtils;

const { showBalance, toCurrencyFormat } = reefUtils;
// const { Loading } = Components.Loading;

const getBalance = (token: TokenWithAmount) => {
  let balance: string|number = showBalance(token);

  balance = parseFloat(balance);
  if (!balance || isNaN(balance)) balance = 0;

  return balance;
};

const capitalize = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

interface TokenPill {
  token: TokenWithAmount;
}

function getHashSumLastNr (address: string): number {
  const summ = address.split('').reduce((sum, ch) => {
    const nr = parseInt(ch, 10);

    if (!Number.isNaN(nr)) {
      return sum + nr;
    }

    return sum;
  }, 0).toString(10);

  return parseInt(summ.substring(summ.length - 1), 10);
}

function getIconUrl (tokenAddress: string): string {
  const lastNr = getHashSumLastNr(tokenAddress);

  return `/img/token-icons/token-icon-${lastNr}.png`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const TokenPill = ({ token }: TokenPill): JSX.Element => (
  <div
    className='token-card'
    key={token.address}
  >
    <Card>
      <div className='token-card__left'>
        <img
          alt={token.name}
          className='token-card__image'
          src={token.iconUrl ? token.iconUrl : getIconUrl(token.address)}
        />

        <div className='token-card__info'>
          <UikText
            className='token-card__name'
            text={capitalize(token.name)}
            type='lead'
          />
          <UikText
            className='token-card__balance'
            text={getBalance(token)}
            type='mini'
          />
        </div>
      </div>

      <div className='token-card__right'>
        <UikText
          className='token-card__value'
          text={isDataSet(token.price) && toCurrencyFormat(token.price, { maximumFractionDigits: token.price < 1 ? 4 : 2 })}
          type='headline'
        />
      </div>
    </Card>
  </div>
);
