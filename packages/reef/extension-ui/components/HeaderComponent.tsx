import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCog, faCoins, faPlusCircle, faWallet } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionContext, SigningReqContext } from '@reef-defi/extension-ui/components';
import MenuAdd from '@reef-defi/extension-ui/partials/MenuAdd';
import Account from '@reef-defi/extension-ui/Popup/Accounts/Account';
import { appState, availableNetworks, hooks, Network, ReefSigner } from '@reef-defi/react-lib';
import React, { useCallback, useContext, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import useOutsideClick from './../../../extension-ui/src/hooks/useOutsideClick';
import MenuSettings from './../../../extension-ui/src/partials/MenuSettings';
import { ReefLogo, ReefTestnetLogo } from './Logos';

interface NavHeaderComp {
  showSettings?: boolean;
}

function NavHeaderComp (): React.ReactElement<NavHeaderComp> {
  const onAction = useContext(ActionContext);
  const network: Network | undefined = hooks.useObservableState(appState.currentNetwork$);
  const mainnetSelected = network == null || network?.rpcUrl === availableNetworks.mainnet.rpcUrl;
  const selectedAccount: ReefSigner | undefined | null = hooks.useObservableState(appState.selectedSigner$);
  const openRoute = useCallback(
    (path: string) => onAction(path),
    [onAction]
  );
  const setRef = useRef(null);
  const addRef = useRef(null);
  const [isSettingsOpen, setShowSettings] = useState(false);
  const [isAddOpen, setShowAdd] = useState(false);
  const requests = useContext(SigningReqContext);
  const hasSignRequests = requests.length > 0;

  useOutsideClick(setRef, (): void => {
    isSettingsOpen && setShowSettings(!isSettingsOpen);
  });

  useOutsideClick(addRef, (): void => {
    isAddOpen && setShowAdd(!isAddOpen);
  });

  const _toggleSettings = useCallback(
    (): void => setShowSettings((isSettingsOpen) => !isSettingsOpen),
    []
  );

  const _toggleAdd = useCallback(
    (): void => setShowAdd((isAddOpen) => !isAddOpen),
    []
  );

  const theme = localStorage.getItem('theme');

  const location = useLocation();

  const showNavigation = (): boolean => {
    if (hasSignRequests) {
      return false;
    }

    if (['/account/create', '/account/export-all', '/account/import-seed', '/bind'].includes(location.pathname)) {
      return false;
    }

    if (location.pathname.startsWith('/account/derive/') ||
      location.pathname.startsWith('/account/export/') ||
      location.pathname.startsWith('/account/forget/')) {
      return false;
    }

    return true;
  };

  const showAccount = (): boolean => {
    return ['/tokens'].includes(location.pathname) && !hasSignRequests;
  };

  return (<div className='navigation__wrapper'>
    {(showNavigation()) && (<div className={['navigation', theme === 'dark' ? 'navigation--dark' : '', !showAccount() ? 'navigation--account' : ''].join(' ')}>
      <a
        className='reef-logo'
        href='#'
        onClick={(ev) => {
          ev.stopPropagation();
          ev.preventDefault();
          openRoute('/tokens');
        }}>
        {mainnetSelected ? <ReefLogo /> : <ReefTestnetLogo />}
      </a>
      <div className='navigation__links'>
        {(['/accounts', '/'].includes(location.pathname)) && (
          <a
            className='navigation__link'
            href='#'
            onClick={(ev) => {
              ev.stopPropagation();
              ev.preventDefault();
              openRoute('/tokens');
            }}
            title='Tokens'
          >
            <FontAwesomeIcon
              className='navigation__link-icon'
              icon={faCoins as any}
            /> Tokens
          </a>
        )}
        {(['/tokens'].includes(location.pathname)) && (
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
            /> Switch account
          </a>
        )}
        {(location.pathname !== '/account/create') && (
          <a
            className='navigation__link'
            href='#'
            onClick={(ev) => {
              ev.stopPropagation();
              ev.preventDefault();
              _toggleAdd();
            }}
            title='Add account'
          >
            <FontAwesomeIcon
              className={'plusIcon'}
              icon={faPlusCircle as IconProp}
              size='lg'
            /> Add account
          </a>
        )}
      </div>
      {isAddOpen && (
        <MenuAdd
          className='menu-add-account'
          reference={addRef}
          setShowAdd={setShowAdd}
        />
      )}

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
    </div>)}
    {showAccount() && (
      <div className='navigation__account--selected'>
        <Account
          hideBalance
          presentation
          {...selectedAccount}
        />
      </div>
    )}
  </div>);
}

export const HeaderComponent = styled(NavHeaderComp)`
  background: #ccc;
  .nav-header {
    background: #000;
  }
`;
