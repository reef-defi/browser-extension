import { faCog, faCoins, faExchangeAlt, faPaperPlane, faWallet } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionContext } from '@reef-defi/extension-ui/components';
import { appState, availableNetworks, hooks, Network, ReefSigner, utils } from '@reef-defi/react-lib';
import React, { useCallback, useContext, useRef, useState } from 'react';
import styled from 'styled-components';
import useOutsideClick from './../../../extension-ui/src/hooks/useOutsideClick';
import MenuSettings from './../../../extension-ui/src/partials/MenuSettings';
import {ReefLogo, ReefTestnetLogo} from './Logos';

interface NavHeaderComp {
  showSettings?: boolean;
}

function NavHeaderComp (): React.ReactElement<NavHeaderComp> {
  const onAction = useContext(ActionContext);
  const selectedAccount: ReefSigner|undefined = hooks.useObservableState(appState.selectedSigner$);
  const network: Network | undefined = hooks.useObservableState(appState.currentNetwork$);
  const mainnetSelected = network == null || network?.name === availableNetworks.mainnet.name;

  const openRoute = useCallback(
    (path: string) => onAction(path),
    [onAction]
  );

  const setRef = useRef(null);

  const [isSettingsOpen, setShowSettings] = useState(false);

  useOutsideClick(setRef, (): void => {
    isSettingsOpen && setShowSettings(!isSettingsOpen);
  });

  const _toggleSettings = useCallback(
    (): void => setShowSettings((isSettingsOpen) => !isSettingsOpen),
    []
  );

  const theme = localStorage.getItem('theme');

  return (<div className={theme === 'dark' ? 'navigation navigation--dark' : 'navigation'}>
    <div className='reef-logo'>
      {mainnetSelected ? <ReefLogo /> : <ReefTestnetLogo />}
    </div>
    <div className='navigation__links'>
      <a
        className='navigation__link'
        href='#'
        onClick={(ev) => {
          ev.stopPropagation();
          ev.preventDefault();
          openRoute('/tokens');
        }}
        title='Dashboard'
      >
        <FontAwesomeIcon
          className='navigation__link-icon'
          icon={faCoins as any}
        />
      </a>
      <a
        className='navigation__link'
        href='#'
        onClick={(ev) => {
          ev.stopPropagation();
          ev.preventDefault();
          openRoute('/transfer');
        }}
        title='Send'
      >
        <FontAwesomeIcon
          className='navigation__link-icon navigation__link-icon--plane'
          icon={faPaperPlane as any}
        />
      </a>
      <a
        className='navigation__link'
        href='#'
        onClick={(ev) => {
          ev.stopPropagation();
          ev.preventDefault();
          openRoute('/swap');
        }}
        title='Swap'
      >
        <FontAwesomeIcon
          className='navigation__link-icon'
          icon={faExchangeAlt as any}
        />
      </a>
      <a
        className='navigation__link'
        href='#'
        onClick={(ev) => {
          ev.stopPropagation();
          ev.preventDefault();
          openRoute('/accounts');
        }}
        title='Accounts'
      >
        <FontAwesomeIcon
          className='navigation__link-icon'
          icon={faWallet as any}
        />
      </a>
    </div>

    <button
      className='navigation__account'
      onClick={() => { openRoute('/accounts'); }}
      type='button'
    >
      <div className='navigation__account-info'>
        <div className='navigation__account-name'>{selectedAccount?.name}</div>
        <div className='navigation__account-address'>{utils.toAddressShortDisplay(selectedAccount?.address || '')}</div>
      </div>
      <div className='navigation__account-tokens'>
        <img src='https://s2.coinmarketcap.com/static/img/coins/64x64/6951.png' />
        <div className='navigation__account-tokens-amount'>{selectedAccount ? utils.toReefBalanceDisplay(selectedAccount.balance).replace('-', '0.00').replace(' REEF', '') : ''}</div>
      </div>
    </button>

    <button
      className={`navigation__settings-btn ${isSettingsOpen ? 'navigation__settings-btn--active' : ''}`}
      onClick={_toggleSettings}
    >
      <FontAwesomeIcon
        className='navigation__settings-icon'
        icon={faCog as any}
      />
    </button>

    {isSettingsOpen && (
      <MenuSettings reference={setRef} />
    )}
  </div>);
}

export const HeaderComponent = styled(NavHeaderComp)`
  background: #ccc;
  .nav-header{background: #000;}
  `;
