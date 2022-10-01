import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionContext } from '@reef-defi/extension-ui/components';
import { Header } from '@reef-defi/extension-ui/partials';
import Account from '@reef-defi/extension-ui/Popup/Accounts/Account';
import { appState, hooks, ReefSigner, TokenWithAmount, utils } from '@reef-defi/react-lib';
import React, { useCallback, useContext } from 'react';

import { Loading, UikText } from './../../uik';
import { TokenPill } from './TokenPill';

const { DataProgress, getData, isDataSet } = utils;

interface TokenBalances {
  tokens: utils.DataWithProgress<TokenWithAmount[]>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const TokenBalances = ({ tokens }: TokenBalances): JSX.Element => {
  const selectedAccount: ReefSigner | undefined | null = hooks.useObservableState(appState.selectedSigner$);

  const onAction = useContext(ActionContext);

  const _onCancel = useCallback(() => {
    onAction('/');
  }, [onAction]);

  return (<>
    <Header
      text={('Tokens')}
      showLogo>
      <div className='steps'>
        <button
          className='popup__close-btn'
          type='button'
          onClick={_onCancel}>
          <FontAwesomeIcon
            className='popup__close-btn-icon'
            icon={faTimes as IconProp}
            title='Close'
          />
        </button>
      </div>
    </Header>
    <div className='navigation__account--selected'>
      <Account
        hideBalance
        presentation
        {...selectedAccount}
      />
    </div>
    <div className='token-balances'>
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
  </>);
};
