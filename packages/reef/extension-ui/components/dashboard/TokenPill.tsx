import { TokenWithAmount, utils as reefUtils} from '@reef-defi/react-lib';
import React from 'react';
import './TokenPill.css';

const { isDataSet } = reefUtils;

const { showBalance, calculateBalanceValue, toCurrencyFormat } = reefUtils;
// const { Loading } = Components.Loading;

interface TokenPill {
  token: TokenWithAmount;
}

function getHashSumLastNr(address: string): number {
  const summ = address.split('').reduce((sum, ch) => {
    const nr = parseInt(ch, 10);
    if (!Number.isNaN(nr)) {
      return sum + nr;
    }
    return sum;
  }, 0).toString(10);

  return parseInt(summ.substring(summ.length - 1), 10);
}

function getIconUrl(tokenAddress: string): string {
  const lastNr = getHashSumLastNr(tokenAddress);
  return `/img/token-icons/token-icon-${lastNr}.png`;
}

export const TokenPill = ({token}: TokenPill): JSX.Element => (
  <div key={token.address} className="col-12 col-md-6">
    <div className="token-balance-item radius-border d-flex d-flex-space-between d-flex-vert-center">
      <div className="token-balance-item_icon-text mr-1">
        <div className="token-balance-item_icon-text_w mr-1"><img
          src={token.iconUrl ? token.iconUrl : getIconUrl(token.address)} alt={token.name}/></div>
        <div className="">
          <div className="title-font text-bold ">{token.name}</div>
          <div className="">{showBalance(token)}</div>
        </div>
      </div>
      <div className=" title-font text-bold text-color-dark-accent">
        <div>
          {isDataSet(token.price) && toCurrencyFormat(token.price as number, {maximumFractionDigits: token.price < 1 ? 4 : 2})}
          {/*{!isDataSet(token.price) && token.price === DataProgress.LOADING && <Loading />}
          {!isDataSet(token.price) && token.price === DataProgress.NO_DATA && ' - '}*/}
        </div>
        <div>
          {isDataSet(reefUtils.calculateBalanceValue(token) &&
            (<div className="d-flex d-flex-space-between d-flex-vert-center">
              <div className="svg-w token-balance-item_balance-value-icon-w">
                <svg version="1.1" x="0px" y="0px" viewBox="0 0 100 125">
                  <g>
                    <path
                      d="M63.02,59.188c-6.502,0-11.792-5.29-11.792-11.792V37.208c0-6.501,5.29-11.791,11.792-11.791h4.76   c0.109-0.007,0.221-0.011,0.334-0.011h20.102v-5.365c0,0,0-6.791-6.792-6.791H13.507c-3.749,0-6.792,3.044-6.792,6.791v59.917   c0,3.747,3.043,6.792,6.792,6.792h67.916c6.792,0,6.792-6.792,6.792-6.792V59.188H63.02z"
                    />
                    <path
                      d="M91.186,30.419v-0.002H91.17c-0.03-0.001-0.052-0.011-0.083-0.011H68.113c-0.037,0-0.07,0.009-0.106,0.011H63.02   c-3.749,0-6.792,3.043-6.792,6.791v10.188c0,3.747,3.043,6.792,6.792,6.792h28.166v-0.014c2.088-0.072,2.1-2.186,2.1-2.186V32.604   C93.285,32.604,93.273,30.491,91.186,30.419z M65.86,46.143c-2.121,0-3.841-1.72-3.841-3.841c0-2.12,1.72-3.84,3.841-3.84   c2.119,0,3.84,1.721,3.84,3.84C69.7,44.422,67.979,46.143,65.86,46.143z"
                    />
                  </g>
                </svg>
              </div>
              <span className="text-xs">{toCurrencyFormat(reefUtils.getData(calculateBalanceValue(token))||0)}</span>
            </div>))}
        </div>
      </div>
    </div>
  </div>
);
