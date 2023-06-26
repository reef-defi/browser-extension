import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCog, faCoins, faExternalLinkAlt, faPlusCircle, faWallet } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionContext, SigningReqContext } from '@reef-defi/extension-ui/components';
import MenuAdd from '@reef-defi/extension-ui/partials/MenuAdd';
import { appState, availableNetworks, hooks, Network } from '@reef-defi/react-lib';
import React, { useCallback, useContext, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { Button } from '../uik/Button';
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

    if (['/account/create', '/account/export-all', '/account/import-seed', '/bind', '/tokens'].includes(location.pathname)) {
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

  const OpenApp = () => {
    return (
      <>
        { // @Todo where can we put the URL to the App?
          <Button
            className='navigation__link--open-app'
            onClick={() => window.open('https://app.reef.io/', '_blank')}
            size='small'
            type='button'
          >
            <FontAwesomeIcon
              className={'plusIcon'}
              icon={faExternalLinkAlt as IconProp}
              size='lg'
            /> Open App
          </Button>
        }
      </>);
  };

  const BuyReef = () => {
    return (
      <>
        { // @Todo where can we put the URL to the App?
          <Button
            className='navigation__link--open-app'
            onClick={() => window.open('https://app.reef.io/buy', '_blank')}
            size='small'
            type='button'
          >
            <FontAwesomeIcon
              className={'plusIcon'}
              icon={faCoins as IconProp}
              size='lg'
            /> Buy Reef
          </Button>
        }
      </>);
  };

  return (<div className='navigation__wrapper'>
    {(showNavigation()) && (<div className={['navigation', theme === 'dark' ? 'navigation--dark' : '', !showAccount() ? 'navigation--account' : ''].join(' ')}>
      <a
        className='reef-logo'
        href='#'
        onClick={(ev) => {
          ev.stopPropagation();
          ev.preventDefault();
          openRoute('/accounts');
        }}>
        {mainnetSelected ? <ReefLogo /> : <ReefTestnetLogo />}
      </a>
      <div className='navigation__links'>
        <BuyReef />
        <OpenApp />

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
            /> Accounts
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
        <MenuSettings
          reference={setRef}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>)}
  </div>);
}

export const HeaderComponent = styled(NavHeaderComp)`
  background: #ccc;
  .nav-header {
    background: #000;
  }
`;
