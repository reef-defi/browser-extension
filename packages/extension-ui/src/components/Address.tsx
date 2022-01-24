// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson, AccountWithChildren } from '@reef-defi/extension-base/background/types';
import type { Chain } from '@reef-defi/extension-chains/types';
import type { IconTheme } from '@polkadot/react-identicon/types';
import type { SettingsStruct } from '@polkadot/ui-settings/types';
import type { KeypairType } from '@polkadot/util-crypto/types';
import type { ThemeProps } from '../types';

import { faUsb } from '@fortawesome/free-brands-svg-icons';
import { faCopy, faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { faCodeBranch, faEllipsisV, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Components, ReefSigner, utils } from '@reef-defi/react-lib';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import styled from 'styled-components';

import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { useObservableState } from '../../../reef/extension-ui/hooks/useObservableState';
import { appState } from '../../../reef/extension-ui/state';
import {provider$, providerSubj} from '../../../reef/extension-ui/state/providerState';
import details from '../assets/details.svg';
import useMetadata from '../hooks/useMetadata';
import useOutsideClick from '../hooks/useOutsideClick';
import useToast from '../hooks/useToast';
import useTranslation from '../hooks/useTranslation';
import { showAccount } from '../messaging';
import { DEFAULT_TYPE } from '../util/defaultType';
import getParentNameSuri from '../util/getParentNameSuri';
import { Button } from './../../../reef/extension-ui/uik';
import { AccountContext, ActionContext, SettingsContext, SigningReqContext } from './contexts';
import Identicon from './Identicon';
import Menu from './Menu';
import Svg from './Svg';

export interface Props {
  actions?: React.ReactNode;
  address?: string | null;
  children?: React.ReactNode;
  className?: string;
  genesisHash?: string | null;
  isExternal?: boolean | null;
  isHardware?: boolean | null;
  isHidden?: boolean;
  name?: string | null;
  parentName?: string | null;
  suri?: string;
  toggleActions?: number;
  type?: KeypairType;
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

function Address ({ actions, address, children, className, genesisHash, isExternal, isHardware, isHidden, name, parentName, suri, toggleActions, type: givenType }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const { accounts } = useContext(AccountContext);
  const selectedAccount = useObservableState(appState.selectedSigner$);
  const signers = useObservableState(appState.signers$);
  const settings = useContext(SettingsContext);
  const [{ account, formatted, genesisHash: recodedGenesis, prefix, type }, setRecoded] = useState<Recoded>(defaultRecoded);
  const chain = useMetadata(genesisHash || recodedGenesis, true);
  const provider = useObservableState(providerSubj);
  const signRequests = useContext(SigningReqContext);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [moveMenuUp, setIsMovedMenu] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const { show } = useToast();

  useOutsideClick(actionsRef, () => (showActionsMenu && setShowActionsMenu(!showActionsMenu)));

  useEffect((): void => {
    if (!address) {
      setRecoded(defaultRecoded);

      return;
    }

    const accountByAddress = findAccountByAddress(accounts, address);

    // addressconsole.log(
    //   address,
    //   (
    //     chain?.definition.chainType === 'ethereum' ||
    //     accountByAddress?.type === 'ethereum' ||
    //     (!accountByAddress && givenType === 'ethereum')
    //   )
    //     ? { account: accountByAddress, formatted: address, type: 'ethereum' }
    //     : recodeAddress(address, accounts, chain, settings)
    // );

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

  const _onCopy = useCallback(
    () => show(t('Copied')),
    [show, t]
  );

  const _toggleVisibility = useCallback(
    () => address && showAccount(address, isHidden || false).catch(console.error),
    [address, isHidden]
  );

  const openEvmBindView = useCallback(
    (bindAddress) => onAction('/bind?bindAddress=' + bindAddress),
    [onAction]
  );

  const External = () => {
    const accountName = name || account?.name;
    const displayName = accountName || t('<unknown>');
    const selected = selectedAccount?.address === account?.address;
    const [signer, setSigner] = useState<ReefSigner>();

    useEffect(() => {
      setSigner(signers?.find((s) => s.address === account?.address));
    }, [signers]);

    const selectAccount = (account: AccountJson | null): void => {
      appState.selectAddressSubj.next(account?.address);
    };

    return (
      <>
        {!!accountName && (account?.isExternal || isExternal) && (
          (account?.isHardware || isHardware)
            ? (
              <FontAwesomeIcon
                className='hardwareIcon'
                icon={faUsb}
                title={t('Hardware Wallet Account')}
              />
            )
            : (
              <FontAwesomeIcon
                className='externalIcon'
                icon={faQrcode}
                title={t('External Account')}
              />
            )
        )}
      </>);
  };

  const Bind = () => {
    const accountName = name || account?.name;
    const displayName = accountName || t('<unknown>');
    const selected = selectedAccount?.address === account?.address;
    const [signer, setSigner] = useState<ReefSigner>();

    useEffect(() => {
      setSigner(signers?.find((s) => s.address === account?.address));
    }, [signers]);

    const selectAccount = (account: AccountJson | null): void => {
      appState.selectAddressSubj.next(account?.address);
    };

    return (
      <>
        {!(!!signRequests && !!signRequests.length) && signer && !signer?.isEvmClaimed && provider && <Button
          className='account-card__bind-btn'
          onClick={() => openEvmBindView(signer?.address)}
          size='small'
        ><span>Bind EVM</span></Button>}
      </>);
  };

  const Balance = () => {
    const accountName = name || account?.name;
    const [signer, setSigner] = useState<ReefSigner>();

    useEffect(() => {
      setSigner(signers?.find((s) => s.address === account?.address));
    }, [signers]);

    const selectAccount = (account: AccountJson | null): void => {
      appState.selectAddressSubj.next(account?.address);
    };

    return (
      <>
        <div>{ utils.toReefBalanceDisplay(signer?.balance).replace('-', '0.00').replace(' REEF', '') }</div>
      </>
    );
  };

  const isSelected = () => {
    const selected = selectedAccount?.address === account?.address;
    const [signer, setSigner] = useState<ReefSigner>();

    useEffect(() => {
      setSigner(signers?.find((s) => s.address === account?.address));
    }, [signers]);

    return !(!!signRequests && !!signRequests.length) && selectedAccount && selected;
  };

  const SelectButton = () => {
    const accountName = name || account?.name;
    const displayName = accountName || t('<unknown>');
    const selected = selectedAccount?.address === account?.address;
    const [signer, setSigner] = useState<ReefSigner>();

    useEffect(() => {
      setSigner(signers?.find((s) => s.address === account?.address));
    }, [signers]);

    const selectAccount = (account: AccountJson | null): void => {
      appState.selectAddressSubj.next(account?.address);
    };

    return (
      <>
        {!(!!signRequests && !!signRequests.length) && selectedAccount && (selected
          ? <Button
            className='account-card__select-btn account-card__select-btn--selected'
            fill
            size='small'
          >Selected</Button>
          : <Button
            className='account-card__select-btn'
            onClick={() => selectAccount(account)}
            size='small'
            type='button'
          >Select</Button>
        )}
      </>
    );
  };

  const parentNameSuri = getParentNameSuri(parentName, suri);

  return (
    <div className={`account-card__wrapper ${isSelected() ? 'account-card__wrapper--selected' : ''}`}>
      <div className='account-card__main'>
        <div className='account-card__identicon'>
          <Identicon
            className='identityIcon'
            iconTheme={theme}
            isExternal={isExternal}
            onCopy={_onCopy}
            prefix={prefix}
            value={formatted || address}
          />
        </div>

        <div className='account-card__info'>
          {parentName
            ? (
              <>
                <div className='account-card__parent'>
                  <FontAwesomeIcon
                    className='deriveIcon'
                    icon={faCodeBranch}
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
            { !children
              ? <div>
                <External />
                <span>{ name || account?.name || '<No Name>' }</span>
              </div>
              : children }
          </div>

          <div className='account-card__balance'>
            <img src='https://s2.coinmarketcap.com/static/img/coins/64x64/6951.png' />
            <div>{ <Balance /> }</div>
          </div>

          <div className='account-card__meta'>
            <div
              className='account-card__address'
              title={formatted || address || ''}
            >{utils.toAddressShortDisplay(formatted || address || '')}</div>
            <CopyToClipboard text={(formatted && formatted) || ''}>
              <FontAwesomeIcon
                className='copyIcon'
                icon={faCopy}
                onClick={_onCopy}
                size='sm'
                title={t('Copy Address')}
              />
            </CopyToClipboard>

            <FontAwesomeIcon
              className={`account-card__visibility ${isHidden ? 'account-card__visibility--hidden' : ''}`}
              icon={isHidden ? faEyeSlash : faEye}
              onClick={_toggleVisibility}
              size='sm'
              title={t('Account Visibility')}
            />
          </div>
        </div>
      </div>

      <div className='account-card__aside'>
        <Bind />
        <SelectButton />

        <div className='account-card__actions'>
          {actions && (
            <>
              <button
                className='account-card__actions-btn'
                onClick={_onClick}
              >
                <FontAwesomeIcon icon={faEllipsisV} />
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

      {chain?.genesisHash && (
        <div
          className='account-card__chain'
          data-field='chain'
          style={
            chain.definition.color
              ? { backgroundColor: chain.definition.color }
              : undefined
          }
        >
          {chain.name.replace(' Relay Chain', '')}
        </div>
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
    font-size: 16px;
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
