import React from 'react';
import {Components, TokenWithAmount, utils} from '@reef-defi/react-lib';
import {TokenPill} from './TokenPill';

const { isDataSet, getData, DataProgress } = utils;

const { Loading } = Components.Loading;

interface TokenBalances {
    tokens: utils.DataWithProgress<TokenWithAmount[]>;
    onRefresh: any;
}

export const TokenBalances = ({ tokens, onRefresh }: TokenBalances): JSX.Element => (
  <div className="row">
    <div className="mb-4 col-12 d-flex d-flex-space-between d-flex-vert-base">
      <div>
        <h5 className="my-auto title-color text-semi-bold">Tokens</h5>
      </div>
      <div>
        <button type="button" className="dashboard_refresh-btn button-light radius-border text-color-dark-accent text-regular" onClick={onRefresh}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path d="M9 12l-4.463 4.969-4.537-4.969h3c0-4.97 4.03-9 9-9 2.395 0 4.565.942 6.179 2.468l-2.004 2.231c-1.081-1.05-2.553-1.699-4.175-1.699-3.309 0-6 2.691-6 6h3zm10.463-4.969l-4.463 4.969h3c0 3.309-2.691 6-6 6-1.623 0-3.094-.65-4.175-1.699l-2.004 2.231c1.613 1.526 3.784 2.468 6.179 2.468 4.97 0 9-4.03 9-9h3l-4.537-4.969z" /></svg>
          Refresh
        </button>
      </div>

    </div>
    <div className="col-12">
      {(!isDataSet(tokens) && tokens === DataProgress.LOADING) && (
      <div className="mt-5">
        <Loading />
      </div>
      )}
      {!!isDataSet(tokens) && (
      <div className="row overflow-auto" style={{ maxHeight: 'auto' }}>
        {getData(tokens)?.map((token) => (<TokenPill token={token} key={token.address} />
        ))}
      </div>
      )}
      {(
        (!!isDataSet(tokens) && !getData(tokens)?.length)
          || (!isDataSet(tokens) && tokens === DataProgress.NO_DATA)
      )
      && (
      <div>No tokens to display.</div>
      )}
    </div>
  </div>

);
