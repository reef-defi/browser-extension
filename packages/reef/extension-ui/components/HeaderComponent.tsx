
import { faCog, faCoins, faExchangeAlt, faPaperPlane, faWallet } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionContext } from '@reef-defi/extension-ui/components';
import { appState, hooks, ReefSigner, utils } from '@reef-defi/react-lib';
import React, { useCallback, useContext, useRef, useState } from 'react';
import styled from 'styled-components';

import useOutsideClick from './../../../extension-ui/src/hooks/useOutsideClick';
import MenuSettings from './../../../extension-ui/src/partials/MenuSettings';

interface NavHeaderComp {
  showSettings?: boolean;
}

function NavHeaderComp (): React.ReactElement<NavHeaderComp> {
  const onAction = useContext(ActionContext);
  const selectedAccount: ReefSigner|undefined | null = hooks.useObservableState(appState.selectedSigner$);
  const openRoute = useCallback(
    (path: string) => onAction(path),
    [onAction]
  );

  // const addRef = useRef(null);
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
      <svg
        enableBackground='new -466.4 720.2 144.6 73.3'
        version='1.1'
        viewBox='-466.4 720.2 144.6 73.3'
        x='0px'
        xmlSpace='preserve'
        xmlns='http://www.w3.org/2000/svg'
        y='0px'
      >
        <path
          d='M-338.3,768.7c-0.9,0-1.7,0.2-2.4,0.5c-0.8,0.3-1.4,0.8-2,1.4c-0.6,0.6-1,1.3-1.3,2c-0.3,0.8-0.5,1.5-0.5,2.4
        c0,0.7,0.1,1.3,0.4,1.9c0.2,0.6,0.6,1.1,1,1.5c0.4,0.4,1,0.8,1.5,1c0.6,0.3,1.2,0.4,1.9,0.4c0.8,0,1.6-0.2,2.3-0.5
        c0.7-0.3,1.3-0.8,1.9-1.4c0.6-0.6,1-1.3,1.3-2.1c0.3-0.8,0.5-1.6,0.5-2.5c0-1.4-0.4-2.5-1.3-3.4
        C-335.8,769.1-336.9,768.7-338.3,768.7z'
          fill='#5631A9'
        />
        <linearGradient
          gradientTransform='matrix(1 0 0 -1 0 794)'
          gradientUnits='userSpaceOnUse'
          id='SVGID_1_'
          x1='-466'
          x2='-321.7493'
          y1='37.15'
          y2='37.15'
        >
          <stop
            offset='0'
            stopColor='#A93185'
          />
          <stop
            offset='1'
            stopColor='#5531A9'
          />
        </linearGradient>
        <path
          d='M-322.2,735.5L-322.2,735.5c-0.3-0.9-0.8-1.7-1.3-2.3c-0.5-0.6-1.2-1.1-1.9-1.4c-0.7-0.3-1.4-0.5-2.2-0.5
        c-1.7,0-3.4,0.3-5.3,0.9c-1.8,0.6-3.7,1.6-5.6,3.1s-3.9,3.5-5.9,6.1s-3.9,5.9-5.9,9.9h-4.9c-1.3,0-2.3,0.3-3,1c-0.7,0.6-1,1.3-1,1.9
        s0.3,1.2,0.8,1.7c0.6,0.5,1.6,0.7,3.1,0.7h2.2l-4.6,9.8c-0.3,0.1-0.7,0.4-1.2,0.7c-0.7,0.4-1.6,1-2.8,1.6c-1.1,0.6-2.3,1.3-3.7,2
        c-1.4,0.7-2.8,1.3-4.2,1.9c-1.4,0.6-2.9,1.1-4.3,1.5s-2.8,0.5-4.1,0.5c-1.2,0-2.2-0.2-2.9-0.7s-1.2-1.1-1.3-1.9
        c3.8-1.4,6.9-2.8,9.4-4.1c2.5-1.4,4.5-2.7,6-4s2.6-2.6,3.2-3.9c0.6-1.3,0.9-2.5,0.9-3.7c0-2-0.6-3.5-1.7-4.6
        c-1.1-1.1-2.9-1.7-5.2-1.7c-2.2,0-4.3,0.3-6.2,1c-1.9,0.6-3.7,1.5-5.3,2.5c-1.6,1.1-3.1,2.3-4.4,3.7c-1.3,1.4-2.4,2.8-3.3,4.2
        c-0.9,1.4-1.6,2.9-2,4.3c-0.4,1.2-0.6,2.2-0.7,3.3c-1,0.6-2.1,1.2-3.4,1.8c-1.4,0.7-2.8,1.3-4.2,1.9c-1.4,0.6-2.9,1.1-4.3,1.5
        c-1.4,0.4-2.8,0.5-4.1,0.5c-1.2,0-2.2-0.2-2.9-0.7s-1.2-1.1-1.3-1.9c3.8-1.4,6.9-2.8,9.4-4.1c2.5-1.4,4.5-2.7,6-4
        c1.5-1.3,2.6-2.6,3.2-3.9s0.9-2.5,0.9-3.7c0-2-0.6-3.5-1.7-4.6c-1.1-1.1-2.9-1.7-5.2-1.7c-2.2,0-4.3,0.3-6.2,1
        c-1.9,0.6-3.7,1.5-5.3,2.5c-1.6,1.1-3.1,2.3-4.4,3.7s-2.4,2.8-3.3,4.2c-0.9,1.4-1.6,2.9-2,4.3c-0.5,1.4-0.7,2.7-0.7,3.9
        c0,0.7,0.1,1.5,0.2,2.2c-0.8,0.5-1.7,1-2.8,1.4c-1.6,0.7-3.4,1-5.4,1h-0.6c-0.2,0-0.4,0-0.6,0c-1.1-0.1-2.2-0.6-3.2-1.7
        c-1-1-1.9-2.3-2.8-3.7c-0.8-1.5-1.5-3-2.1-4.6s-1-3.1-1.2-4.4c1.8-0.3,3.6-0.8,5.5-1.5c1.9-0.7,3.8-1.5,5.6-2.5
        c1.8-1,3.5-2.1,5.1-3.4c1.6-1.3,3-2.7,4.2-4.3s2.1-3.2,2.8-5c0.7-1.8,1.1-3.6,1.1-5.6c0-2.9-0.6-5.4-1.8-7.6s-2.8-4-4.8-5.4
        c-2-1.4-4.3-2.5-6.9-3.3c-2.6-0.7-5.3-1.1-8.1-1.1c-2.9,0-5.6,0.3-8.2,0.9c-2.6,0.6-5,1.4-7.2,2.4c-2.2,1-4.1,2.1-5.9,3.4
        c-1.8,1.3-3.2,2.6-4.5,4c-1.2,1.4-2.1,2.8-2.8,4.2c-0.6,1.4-1,2.7-1,3.9c0,1.3,0.3,2.3,1,3s1.7,1,3.1,1c1,0,1.9-0.2,2.6-0.7
        c0.7-0.5,1.3-1.1,1.9-1.8c0.6-0.8,1.1-1.6,1.7-2.6c0.5-1,1.1-2,1.8-3s1.4-2,2.3-3c0.9-1,2-1.8,3.3-2.6c1.3-0.8,2.9-1.4,4.7-1.8
        c1.8-0.5,4-0.7,6.5-0.7c2.3,0,4.2,0.3,5.8,0.8s3,1.2,4,2.1c1.1,0.9,1.8,1.9,2.3,3.1s0.8,2.5,0.8,3.8c0,1.9-0.5,3.8-1.4,5.8
        s-2.2,3.8-3.8,5.4c-1.6,1.6-3.5,2.9-5.7,4c-2.1,1-4.4,1.5-6.8,1.5h-0.6c-0.2,0-0.3,0-0.5,0c0.7-1.5,1.4-3,2.1-4.5s1.3-2.8,1.8-4
        c0.5-1.2,0.9-2.3,1.2-3.3c0.3-0.9,0.5-1.7,0.5-2.2s-0.1-1-0.3-1.3c-0.2-0.4-0.4-0.6-0.6-0.8c-0.2-0.2-0.5-0.3-0.8-0.4
        c-0.3-0.1-0.5-0.1-0.7-0.1c-0.7,0-1.5,0.4-2.5,1.3c-0.9,0.8-1.8,1.9-2.9,3.3c-1,1.4-2,2.9-3.1,4.7c-1.1,1.8-2.1,3.6-3.2,5.5
        l-12.3,22.5c-0.3,0.6-0.5,1.2-0.7,1.9c-0.2,0.7-0.2,1.3-0.2,2c0,0.4,0.1,0.9,0.2,1.4c0.1,0.5,0.4,1,0.7,1.4s0.7,0.8,1.3,1
        c0.6,0.3,1.3,0.4,2.2,0.4c1.1,0,2.1-0.4,3-1.2c0.9-0.8,1.8-1.8,2.6-3c0.8-1.3,1.5-2.7,2.2-4.3c0.7-1.6,1.3-3.2,1.9-4.9
        c0.6-1.6,1.2-3.2,1.7-4.8s1-2.9,1.5-4c0.9,2.9,1.9,5.6,3,8.3c1.1,2.6,2.4,4.9,3.8,6.8c1.4,1.9,2.9,3.5,4.6,4.6
        c1.7,1.1,3.5,1.7,5.5,1.7c2.4,0,5-0.6,7.8-1.8c1.3-0.6,2.7-1.4,4-2.3c0.2,0.3,0.4,0.6,0.6,0.8c0.9,1.1,2,1.9,3.3,2.6
        c1.3,0.6,2.8,1,4.5,1c1.9,0,3.9-0.3,5.9-0.8s3.9-1.1,5.8-1.9c1.9-0.8,3.6-1.6,5.3-2.5c1-0.6,1.9-1.1,2.8-1.6
        c0.5,1.3,1.1,2.4,1.9,3.4c0.9,1.1,2,1.9,3.3,2.6c1.3,0.6,2.8,1,4.5,1c1.9,0,3.9-0.3,5.9-0.8s3.9-1.1,5.8-1.9
        c1.9-0.8,3.6-1.6,5.3-2.5c0.8-0.5,1.6-0.9,2.3-1.4l-6.2,13.2c-0.3,0.6-0.5,1.2-0.7,1.7s-0.2,0.9-0.2,1.3c0,0.7,0.3,1.3,0.8,1.6
        c0.5,0.3,1.1,0.5,1.8,0.5c0.5,0,1-0.1,1.5-0.3c0.6-0.2,1.1-0.5,1.6-0.9s1-0.9,1.5-1.4c0.4-0.5,0.8-1.1,1.1-1.8
        c0.4-0.9,1-2.1,1.8-3.6c0.7-1.5,1.5-3.2,2.4-5.1c0.9-1.9,1.8-3.9,2.8-6c1-2.1,2-4.2,3-6.3s1.9-4,2.8-5.9s1.7-3.5,2.5-5h7.3
        c1.2,0,2.5-0.1,3.8-0.1s2.7-0.1,4.1-0.1c0.8-0.1,1.4-0.2,1.8-0.3c0.5-0.2,0.8-0.4,1.1-0.7c0.3-0.3,0.5-0.6,0.6-0.9
        c0.1-0.3,0.2-0.6,0.2-0.9c0-0.6-0.2-1.1-0.5-1.4c-0.3-0.3-0.8-0.6-1.3-0.7c-0.6-0.1-1.2-0.2-2-0.3c-0.8,0-1.6,0-2.4,0h-9.7
        c0.7-1.7,1.6-3.3,2.7-4.9c1.1-1.6,2.2-3,3.4-4.3c1.2-1.3,2.4-2.3,3.5-3c1.2-0.8,2.2-1.1,3-1.1c0.7,0,1.3,0.3,1.7,0.8
        s0.7,1.3,0.7,2.5c0,0.3,0,0.6-0.1,0.9c0,0.3,0,0.6,0,1c0,0.6,0.2,1,0.7,1.3s1,0.4,1.5,0.4c0.2,0,0.5,0,0.8-0.1s0.6-0.2,0.9-0.4
        c0.3-0.2,0.6-0.4,0.8-0.6c0.3-0.3,0.4-0.6,0.5-1c0.3-1.4,0.5-2.8,0.5-4C-321.7,737.5-321.9,736.4-322.2,735.5z M-412.1,766.8
        c0.2-0.5,0.4-1,0.6-1.7c0.3-0.8,0.7-1.6,1.2-2.4c0.5-0.9,1-1.7,1.6-2.6c0.6-0.9,1.3-1.6,2-2.3c0.8-0.7,1.6-1.3,2.5-1.7
        c0.9-0.4,1.9-0.6,3-0.6h0.4c0.1,0,0.2,0,0.4,0c0.3,0.1,0.6,0.2,0.9,0.5c0.3,0.3,0.4,0.6,0.4,1c0,0.5-0.2,1.1-0.7,1.8
        c-0.5,0.7-1.3,1.4-2.6,2.2c-0.3,0.2-0.8,0.5-1.5,1s-1.5,1-2.4,1.6s-1.9,1.2-3,1.8c-1,0.6-1.9,1.1-2.8,1.6
        C-412,766.9-412,766.9-412.1,766.8z M-382.1,765.2c0.3-0.8,0.7-1.6,1.2-2.4c0.5-0.9,1-1.7,1.6-2.6c0.6-0.9,1.3-1.6,2-2.3
        c0.8-0.7,1.6-1.3,2.5-1.7c0.9-0.4,1.9-0.6,3-0.6h0.4c0.1,0,0.2,0,0.4,0c0.3,0.1,0.6,0.2,0.9,0.5c0.3,0.3,0.4,0.6,0.4,1
        c0,0.5-0.2,1.1-0.7,1.8c-0.5,0.7-1.3,1.4-2.6,2.2c-0.3,0.2-0.8,0.5-1.5,1s-1.5,1-2.4,1.6s-1.9,1.2-3,1.8c-1,0.6-2,1.2-3,1.7
        C-382.7,766.6-382.4,765.9-382.1,765.2z'
          fill='url(#SVGID_1_)'
        />
      </svg>
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
