// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../types';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useContext, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import styled from 'styled-components';

import { Button } from '../../../reef/extension-ui/uik/Button';
import { ActionContext, Address, ButtonArea, InputWithLabel, VerticalSpace, Warning } from '../components';
import useTranslation from '../hooks/useTranslation';
import { exportAccount } from '../messaging';
import { Header } from '../partials';
import QRCodeComponent from '../partials/QrCodeComponent';

const MIN_LENGTH = 6;

interface Props extends RouteComponentProps<{address: string}>, ThemeProps {
  className?: string;
}

function ExportQr ({ className, match: { params: { address } } }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const [isBusy, setIsBusy] = useState(false);
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [qrCode, setQrCode] = useState('');

  const _goHome = useCallback(
    () => onAction('/'),
    [onAction]
  );

  const onPassChange = useCallback(
    (password: string) => {
      setPass(password);
      setError('');
    }
    , []);

  const displayQrCode = useCallback(
    (jsonData: string) => {
      setQrCode(jsonData);
      
    }
    , []);

  const _onExportButtonClick = useCallback(
    (): void => {
      setIsBusy(true);

      exportAccount(address, pass)
        .then(({ exportedJson }) => {
            const QrCodeValue = {
                type: 'importAccount',
                data: JSON.stringify({
                    encoded: exportedJson.encoded,
                    encoding: exportedJson.encoding,
                    address: exportedJson.address,
                }),
            };
        
          displayQrCode(JSON.stringify(QrCodeValue));
        })
        .catch((error: Error) => {
          console.error(error);
          setError(error.message);
          setIsBusy(false);
        });
    },
    [address, onAction, pass]
  );

  return (
    <>
      <Header
        showLogo
        text={t<string>('Export account')}>
        <div className='steps'>
          <button
            className='popup__close-btn'
            type='button'
            onClick={_goHome}>
            <FontAwesomeIcon
              className='popup__close-btn-icon'
              icon={faTimes as IconProp}
              title='Close'
            />
          </button>
        </div>
      </Header>
      <div className={className}>
        <Address
          address={address}
          exporting
          presentation
        >
            {qrCode==''&& (
          <Warning className='movedWarning'>
            {t<string>("You are exporting your account. Keep it safe and don't share it with anyone.")}<br />
            {t<string>('Password must be at least ' + MIN_LENGTH + ' characters long.')}
          </Warning>
                )}
          <div className='actionArea'>
            <InputWithLabel
              data-export-password
              disabled={isBusy}
              isError={pass.length < MIN_LENGTH || !!error}
              label={t<string>('password for this account')}
              onChange={onPassChange}
              type='password'
            />
            {qrCode!='' && (
                <QRCodeComponent value={qrCode}/>
            )}
            {error && (
              <Warning
                isBelowInput
                isDanger
              >
                {error}
              </Warning>
            )}
          </div>
        </Address>
      </div>
      <VerticalSpace />
      {qrCode==''&&(
        <ButtonArea>
        <Button
          className='uik-button--fullWidth export-button'
          rounded
          danger
          size='large'
          data-export-button
          disabled={pass.length < MIN_LENGTH || !!error}
          loading={isBusy}
          onClick={_onExportButtonClick}>
          {t<string>('I want to export this account')}
        </Button>
      </ButtonArea>
      )}
    </>
  );
}

export default withRouter(styled(ExportQr)`
  margin-top: 15px;
  .actionArea {
    padding: 10px 24px;
  }

  .movedWarning {
    margin-top: 8px;
  }
`);
