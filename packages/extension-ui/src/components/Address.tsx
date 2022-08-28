// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson, AccountWithChildren } from '@reef-defi/extension-base/background/types';
import type { Chain } from '@reef-defi/extension-chains/types';
import type { IconTheme } from '@polkadot/react-identicon/types';
import type { SettingsStruct } from '@polkadot/ui-settings/types';
import type { KeypairType } from '@polkadot/util-crypto/types';
import type { ThemeProps } from '../types';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faUsb } from '@fortawesome/free-brands-svg-icons';
import { faCopy, faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { faCodeBranch, faEllipsisV, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Provider } from '@reef-defi/evm-provider';
import { appState, hooks, ReefSigner, utils } from '@reef-defi/react-lib';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import styled from 'styled-components';

import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import useMetadata from '../hooks/useMetadata';
import useOutsideClick from '../hooks/useOutsideClick';
import useTranslation from '../hooks/useTranslation';
import { showAccount } from '../messaging';
import { DEFAULT_TYPE } from '../util/defaultType';
import getParentNameSuri from '../util/getParentNameSuri';
import notify from './../../../reef/extension-ui/notify';
import { Button, Loading } from './../../../reef/extension-ui/uik';
import { AccountContext, ActionContext, SettingsContext, SigningReqContext } from './contexts';
import Identicon from './Identicon';
import Menu from './Menu';

export interface Props {
  actions?: React.ReactNode;
  address?: string | null;
  children?: React.ReactNode;
  className?: string;
  genesisHash?: string | null;
  isExternal?: boolean | null;
  isHardware?: boolean | null;
  isHidden?: boolean;
  hideBalance?: any;
  name?: string | null;
  parentName?: string | null;
  suri?: string;
  toggleActions?: number;
  type?: KeypairType;
  exporting?: any;
  presentation?: any;
  signerProp?: ReefSigner;
}

interface Recoded {
  account: AccountJson | null;
  formatted: string | null;
  genesisHash?: string | null;
  prefix?: number;
  type: KeypairType;
}

// find an account in our list
function findSubstrateAccount (accounts: AccountJson[], publicKey: Uint8Array): AccountJson | null {
  const pkStr = publicKey.toString();

  return accounts.find(({ address }): boolean =>
    decodeAddress(address).toString() === pkStr
  ) || null;
}

// find an account in our list
function findAccountByAddress (accounts: AccountJson[], _address: string): AccountJson | null {
  return accounts.find(({ address }): boolean =>
    address === _address
  ) || null;
}

// recodes an supplied address using the prefix/genesisHash, include the actual saved account & chain
function recodeAddress (address: string, accounts: AccountWithChildren[], chain: Chain | null, settings: SettingsStruct): Recoded {
  // decode and create a shortcut for the encoded address
  const publicKey = decodeAddress(address);

  // find our account using the actual publicKey, and then find the associated chain
  const account = findSubstrateAccount(accounts, publicKey);
  const prefix = chain ? chain.ss58Format : (settings.prefix === -1 ? 42 : settings.prefix);

  // always allow the actual settings to override the display
  return {
    account,
    formatted: account?.type === 'ethereum'
      ? address
      : encodeAddress(publicKey, prefix),
    genesisHash: account?.genesisHash,
    prefix,
    type: account?.type || DEFAULT_TYPE
  };
}

const ACCOUNTS_SCREEN_HEIGHT = 550;
const defaultRecoded = { account: null, formatted: null, prefix: 42, type: DEFAULT_TYPE };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Address ({ actions, address, children, className, exporting, genesisHash, hideBalance, isExternal, isHardware, isHidden, name, parentName, presentation, signerProp, suri, toggleActions, type: givenType }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const { accounts } = useContext(AccountContext);
  const selectedAccount: ReefSigner|undefined | null = hooks.useObservableState(appState.selectedSigner$);
  const signers: ReefSigner[]|undefined | null = hooks.useObservableState(appState.signers$);
  const settings = useContext(SettingsContext);
  const [{ account, formatted, genesisHash: recodedGenesis, prefix, type }, setRecoded] = useState<Recoded>(defaultRecoded);
  const chain = useMetadata(genesisHash || recodedGenesis, true);
  const provider: Provider|undefined = hooks.useObservableState(appState.currentProvider$);
  const signRequests = useContext(SigningReqContext);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [moveMenuUp, setIsMovedMenu] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const [signer, setSigner] = useState<ReefSigner|undefined>(signerProp);
  const openRoute = useCallback(
    (path: string) => onAction(path),
    [onAction]
  );

  useEffect(() => {
    const foundSigner = signers?.find((s) => s.address === account?.address);

    if (foundSigner) {
      setSigner(foundSigner);
    }
  }, [signers, account]);

  useOutsideClick(actionsRef, () => (showActionsMenu && setShowActionsMenu(!showActionsMenu)));

  useEffect((): void => {
    if (!address) {
      setRecoded(defaultRecoded);

      return;
    }

    const accountByAddress = findAccountByAddress(accounts, address);

    setRecoded(
      (
        chain?.definition.chainType === 'ethereum' ||
        accountByAddress?.type === 'ethereum' ||
        (!accountByAddress && givenType === 'ethereum')
      )
        ? { account: accountByAddress, formatted: address, type: 'ethereum' }
        : recodeAddress(address, accounts, chain, settings));
  }, [accounts, address, chain, givenType, settings]);

  useEffect(() => {
    if (!showActionsMenu) {
      setIsMovedMenu(false);
    } else if (actionsRef.current) {
      const { bottom } = actionsRef.current.getBoundingClientRect();

      if (bottom > ACCOUNTS_SCREEN_HEIGHT) {
        setIsMovedMenu(true);
      }
    }
  }, [showActionsMenu]);

  useEffect((): void => {
    setShowActionsMenu(false);
  }, [toggleActions]);

  const theme = (
    type === 'ethereum'
      ? 'ethereum'
      : (chain?.icon || 'polkadot')
  ) as IconTheme;

  const _onClick = useCallback(
    () => setShowActionsMenu(!showActionsMenu),
    [showActionsMenu]
  );

  const _toggleVisibility = useCallback(
    () => address && showAccount(address, isHidden || false).catch(console.error),
    [address, isHidden]
  );

  const openEvmBindView = useCallback(
    (bindAddress: string) => onAction(`/bind?bindAddress=${bindAddress}`),
    [onAction]
  );

  const External = () => {
    const accountName = name || account?.name;

    return (
      <>
        {!!accountName && (account?.isExternal || isExternal) && (
          (account?.isHardware || isHardware)
            ? (
              <FontAwesomeIcon
                className='hardwareIcon'
                icon={faUsb as IconProp}
                title={t('Hardware Wallet Account')}
              />
            )
            : (
              <FontAwesomeIcon
                className='externalIcon'
                icon={faQrcode as IconProp}
                title={t('External Account')}
              />
            )
        )}
      </>);
  };

  const Bind = () => {
    return (
      <>
        {!(!!signRequests && !!signRequests.length) && signer && !signer?.isEvmClaimed && provider &&
          <Button
            className='account-card__bind-btn'
            fill
            onClick={() => openEvmBindView(signer?.address)}
            size='small'
            type='button'
          >
            <span>Connect EVM</span>
          </Button>
        }
      </>);
  };

  const OpenApp = () => {
    return (
      <>
        { // @Todo where can we put the URL to the App?
          <Button
            className='account-card__bind-btn'
            fill
            onClick={() => window.open('https://app.reef.io/', '_blank')}
            size='small'
            type='button'
          >
            <span>Open App</span>
          </Button>
        }
      </>);
  };

  const Balance = () => {
    return (
      <>
        <div>{ utils.toReefBalanceDisplay(signer?.balance).replace('-', '0.00').replace(' REEF', '') }</div>
      </>
    );
  };

  const isSelected = () => {
    const selected = selectedAccount?.address === account?.address;

    return !(!!signRequests && !!signRequests.length) && selectedAccount && selected;
  };

  const SelectButton = () => {
    const selected = selectedAccount?.address === account?.address;

    const selectAccount = (account: AccountJson | null): void => {
      appState.setCurrentAddress(account?.address);
      openRoute('/tokens'); // redirect to tokens page
    };

    return (
      <>
        {!(!!signRequests && !!signRequests.length) && selectedAccount && (selected
          ? <Button
            className='account-card__select-btn account-card__select-btn--selected'
            fill
            size='small'
            type='button'
          >Selected
          </Button>
          : <Button
            className='account-card__select-btn'
            onClick={() => selectAccount(account)}
            size='small'
            type='button'
          >Select
          </Button>
        )
        }
      </>
    );
  };

  const parentNameSuri = getParentNameSuri(parentName, suri);

  return (
    <div className={`
      account-card__wrapper
      ${isSelected() && !presentation ? 'account-card__wrapper--selected' : ''}
      ${exporting ? 'account-card__wrapper--exporting' : ''}
    `}
    >
      <div className='account-card__main'>
        <div className='account-card__identicon'>
          {signer &&
          <Identicon
            className='identityIcon'
            iconTheme={theme}
            isExternal={isExternal}
            onCopy={
              () => notify.info({
                aliveFor: 2,
                message: 'Copied to clipboard'
              })
            }
            prefix={prefix}
            value={formatted || address}
          />
          }
          {!(!!signRequests && !!signRequests.length) && !signer && <div className={'account-card__identicon--loading'}><Loading /></div>}
        </div>

        <div className='account-card__info'>
          {parentName
            ? (
              <>
                <div className='account-card__parent'>
                  <FontAwesomeIcon
                    className='deriveIcon'
                    icon={faCodeBranch as IconProp}
                  />
                  <span
                    className='account-card__parent-name'
                    data-field='parent'
                    title = {parentNameSuri}
                  >
                    {parentNameSuri}
                  </span>
                </div>
              </>
            )
            : ''
          }
          <div className='account-card__name'>
            { !children || exporting
              ? <div>
                <External />
                <span>{ name || account?.name || '<No Name>' }</span>
              </div>
              : children }
          </div>

          {signer && (!presentation || !hideBalance) && <div className='account-card__status'>
            {
              !presentation &&
              <FontAwesomeIcon
                className={`account-card__visibility ${isHidden ? 'account-card__visibility--hidden' : 'account-card__visibility--visible'}`}
                icon={(isHidden ? faEyeSlash : faEye) as IconProp}
                onClick={_toggleVisibility}
                size='sm'
                title={t('Account Visibility')}
              />
            }
            {
              !hideBalance &&
              <div className='account-card__balance'>
                <img
                  alt='balance'
                  src='https://s2.coinmarketcap.com/static/img/coins/64x64/6951.png'
                />
                <div>{<Balance />}</div>
              </div>
            }
          </div>}

          <CopyToClipboard text={(formatted && formatted) || ''}>
            <div
              className='account-card__meta'
              onClick={() => notify.info({
                aliveFor: 2,
                message: 'Copied Reef Account Address to clipboard.'
              })}>
              <div
                className='account-card__address'
                title={formatted || address || ''}
              >
                <label>Native address:</label>
                {utils.toAddressShortDisplay(formatted || address || '')}
              </div>
              <FontAwesomeIcon
                className='copyIcon'
                icon={faCopy as IconProp}
                size='sm'
                title={t('Copy Reef Account Address')}
              />
            </div>
          </CopyToClipboard>

          {
            signer?.evmAddress && signer?.isEvmClaimed
              ? <>
                <CopyToClipboard text={(signer?.evmAddress) ? `${utils.addReefSpecificStringFromAddress(signer.evmAddress)}` : ''}><div
                  className='account-card__meta'
                  onClick={() => notify.danger({
                    children:
                        <Button
                          text='I understand'
                          type='button'
                        />,
                    keepAlive: true,
                    message: 'Copied to clipboard.\nDO NOT use this Reef EVM address on any other chain. ONLY use it on Reef chain.'
                  })}>
                  <div
                    className='account-card__address'
                    title={signer?.evmAddress || ''}
                  >
                    <label>EVM Address:</label>
                    {utils.toAddressShortDisplay(signer?.evmAddress || '')}
                  </div>
                  <FontAwesomeIcon
                    className='copyIcon'
                    icon={faCopy as IconProp}
                    size='sm'
                    title={t('Copy Ethereum VM Address')
                    }
                  />
                </div>
                </CopyToClipboard>
              </>
              : ''
          }
        </div>
      </div>

      {
        !exporting
          ? (
            <div className='account-card__aside'>
              { !signer?.isEvmClaimed ? <Bind /> : '' }
              {!isSelected() && !presentation ? <SelectButton /> : ''}
              {isSelected() && presentation && signer && signer.isEvmClaimed ? <OpenApp /> : ''}

              <div className='account-card__actions'>
                {actions && (
                  <>
                    <button
                      className='account-card__actions-btn'
                      onClick={_onClick}
                    >
                      <FontAwesomeIcon icon={faEllipsisV as IconProp} />
                    </button>
                    {showActionsMenu && (
                      <Menu
                        className={`movableMenu ${moveMenuUp ? 'isMoved' : ''}`}
                        reference={actionsRef}
                      >
                        {actions}
                      </Menu>
                    )}
                  </>
                )}
              </div>
            </div>
          )
          : ''
      }

      {
        exporting ? (<div className='account-card__exporting'>{children}</div>) : ''
      }

      {isSelected() && !presentation && (
        <div className='account-card__chain'>Selected</div>
      )}
    </div>
  );
}

export default styled(Address)(({ theme }: ThemeProps) => `
  background: ${theme.accountBackground};
  border: 1px solid ${theme.boxBorderColor};
  box-sizing: border-box;
  border-radius: 4px;
  margin-bottom: 8px;
  position: relative;

  .banner {
    font-size: 12px;
    line-height: 16px;
    position: absolute;
    top: 0;

    &.chain {
      background: ${theme.primaryColor};
      border-radius: 0 0 0 10px;
      color: white;
      padding: 0.1rem 0.5rem 0.1rem 0.75rem;
      right: 0;
      z-index: 1;
    }
  }

  .addressDisplay {
    display: flex;
    justify-content: space-between;
    position: relative;

    .svg-inline--fa {
      width: 14px;
      height: 14px;
      margin-right: 10px;
      color: ${theme.accountDotsIconColor};
      &:hover {
        color: ${theme.labelColor};
        cursor: pointer;
      }
    }

    .hiddenIcon, .visibleIcon {
      position: absolute;
      right: 2px;
      top: -18px;
    }

    .hiddenIcon {
      color: ${theme.errorColor};
      &:hover {
        color: ${theme.accountDotsIconColor};
      }
    }
  }

  .externalIcon, .hardwareIcon {
    margin-right: 0.3rem;
    color: ${theme.labelColor};
    width: 0.875em;
  }

  .identityIcon {
    margin-left: 15px;
    margin-right: 10px;

    & svg {
      width: 50px;
      height: 50px;
    }
  }

  .info {
    width: 100%;
  }

  .infoRow {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    height: 72px;
    border-radius: 4px;
  }

  img {
    max-width: 50px;
    max-height: 50px;
    border-radius: 50%;
  }

  .name {
    font-size: 15px;
    line-height: 22px;
    margin: 2px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 345px;
    white-space: nowrap;
    display: flex;
    justify-content: space-between;

    &.displaced {
      padding-top: 10px;
    }
  }

  .parentName {
    color: ${theme.labelColor};
    font-size: ${theme.inputLabelFontSize};
    line-height: 14px;
    overflow: hidden;
    padding: 0.25rem 0 0 0.8rem;
    text-overflow: ellipsis;
    width: 270px;
    white-space: nowrap;
  }

  .fullAddress {
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${theme.labelColor};
    font-size: 12px;
    line-height: 16px;
  }

  .detailsIcon {
    background: ${theme.accountDotsIconColor};
    width: 3px;
    height: 19px;

    &.active {
      background: ${theme.primaryColor};
    }
  }

  .deriveIcon {
    color: ${theme.labelColor};
    position: absolute;
    top: 5px;
    width: 9px;
    height: 9px;
  }

  .movableMenu {
    margin-top: -20px;
    right: 28px;
    top: 0;

    &.isMoved {
      top: auto;
      bottom: 0;
    }
  }

  .settings {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 40px;

    &:before {
      content: '';
      position: absolute;
      left: 0;
      top: 25%;
      bottom: 25%;
      width: 1px;
      background: ${theme.boxBorderColor};
    }

    &:hover {
      cursor: pointer;
      background: ${theme.readonlyInputBackground};
    }
  }
`);
