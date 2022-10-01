// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../types';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faUsb } from '@fortawesome/free-brands-svg-icons';
import { faCodeBranch, faFileExport, faFileUpload, faKey, faPlusCircle, faQrcode, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Header } from '@reef-defi/extension-ui/partials';
import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';

import { AccountContext, Link, MediaContext, Menu, MenuDivider, MenuItem } from '../components';
import useIsPopup from '../hooks/useIsPopup';
import { useLedger } from '../hooks/useLedger';
import useTranslation from '../hooks/useTranslation';
import { windowOpen } from '../messaging';

interface Props extends ThemeProps {
  className?: string;
  reference: React.MutableRefObject<null>;
  setShowAdd: React.Dispatch<React.SetStateAction<boolean>>;
}

const jsonPath = '/account/restore-json';
const ledgerPath = '/account/import-ledger';

function MenuAdd ({ className, reference, setShowAdd }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { master } = useContext(AccountContext);
  const mediaAllowed = useContext(MediaContext);
  const { isLedgerCapable, isLedgerEnabled } = useLedger();
  const isPopup = useIsPopup();

  const _openJson = useCallback(
    () => windowOpen(jsonPath)
    , []);

  const _onOpenLedgerConnect = useCallback(
    () => windowOpen(ledgerPath),
    []
  );

  const _closePopup = () => setShowAdd(false);

  return (
    <Menu
      className={className}
      reference={reference}
    >
      <Header
        text={t<string>('Add account menu')}
      >
        <div className='steps'>
          <button
            className='popup__close-btn'
            type='button'
            onClick={_closePopup}>
            <FontAwesomeIcon
              className='popup__close-btn-icon'
              icon={faTimes as IconProp}
              title='Close'
            />
          </button>
        </div>
      </Header>
      <MenuItem className='menuItem menuItem--space'>
        <Link
          to={'/account/create'}
          onClick={_closePopup}>
          <FontAwesomeIcon icon={faPlusCircle as IconProp} />
          <span>{ t('Create new account')}</span>
        </Link>
      </MenuItem>
      <MenuDivider />
      {!!master && (
        <>
          <MenuItem className='menuItem'>
            <Link
              to={`/account/derive/${master.address}`}
              onClick={_closePopup}>
              <FontAwesomeIcon icon={faCodeBranch as IconProp} />
              <span>{t('Derive from an account')}</span>
            </Link>
          </MenuItem>
          <MenuDivider />
        </>
      )}
      <MenuItem className='menuItem'>
        <Link
          to={'/account/export-all'}
          onClick={_closePopup}>
          <FontAwesomeIcon icon={faFileExport as IconProp} />
          <span>{t<string>('Export all accounts')}</span>
        </Link>
      </MenuItem>
      <MenuItem className='menuItem'>
        <Link
          to='/account/import-seed'
          onClick={_closePopup}>
          <FontAwesomeIcon icon={faKey as IconProp} />
          <span>{t<string>('Import account from pre-existing seed')}</span>
        </Link>
      </MenuItem>
      <MenuItem className='menuItem'>
        <Link
          onClick={isPopup ? _openJson : undefined}
          to={isPopup ? undefined : jsonPath}
        >
          <FontAwesomeIcon icon={faFileUpload as IconProp} />
          <span>{t<string>('Restore account from backup JSON file')}</span>
        </Link>
      </MenuItem>
      <MenuDivider />
      <MenuItem className='menuItem'>
        <Link
          isDisabled={!mediaAllowed}
          title={!mediaAllowed
            ? t<string>('Camera access must be first enabled in the settings')
            : ''
          }
          to='/account/import-qr'
          onClick={_closePopup}
        >
          <FontAwesomeIcon icon={faQrcode as IconProp} />
          <span>{t<string>('Attach external QR-signer account')}</span>
        </Link>
      </MenuItem>
      <MenuItem className='menuItem ledger'>
        {isLedgerEnabled
          ? (
            <Link
              isDisabled={!isLedgerCapable}
              title={ (!isLedgerCapable && t<string>('Ledger devices can only be connected with Chrome browser')) || ''}
              to={ledgerPath}
              onClick={_closePopup}
            >
              <FontAwesomeIcon
                icon={faUsb as IconProp}
                rotation={270}
              />
              <span>{ t<string>('Attach ledger account')}</span>
            </Link>
          )
          : (
            <Link onClick={_onOpenLedgerConnect}>
              <FontAwesomeIcon
                icon={faUsb as IconProp}
                rotation={270}
              />
              <span>{ t<string>('Connect Ledger device')}</span>
            </Link>
          )
        }
      </MenuItem>
    </Menu>
  );
}

export default React.memo(styled(MenuAdd)(({ theme }: Props) => `
  margin-top: 50px;
  right: 50px; // 24 + 18 + 8
  user-select: none;

  .menuItem {
    span:first-child {
      height: 20px;
      margin-right: 8px;
      opacity: 0.5;
      width: 20px;
    }

    span {
      vertical-align: middle;
    }

    .svg-inline--fa {
      color: ${theme.iconNeutralColor};
      margin-right: 0.3rem;
      width: 17px;
    }

    &.menuItem--space {
      margin-top: 21px;
    }
  }
`));
