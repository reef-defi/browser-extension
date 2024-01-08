// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../types';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCopy, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useContext, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { RouteComponentProps, withRouter } from 'react-router';
import styled from 'styled-components';

import { u8aEq, u8aToHex } from '@polkadot/util';
import { jsonDecrypt } from '@polkadot/util-crypto';

import { Button } from '../../../reef/extension-ui/uik/Button';
import { ActionContext, Address, ButtonArea, InputWithLabel, VerticalSpace, Warning } from '../components';
import useTranslation from '../hooks/useTranslation';
import { exportAccount } from '../messaging';
import { Header } from '../partials';
import notify from './../../../reef/extension-ui/notify';

const MIN_LENGTH = 6;
const PKCS8_DIVIDER = new Uint8Array([161, 35, 3, 33, 0]);
const PKCS8_HEADER = new Uint8Array([48, 83, 2, 1, 1, 48, 5, 6, 3, 43, 101, 112, 4, 34, 4, 32]);
const PUB_LENGTH = 32;
const SEC_LENGTH = 64;
const SEED_LENGTH = 32;

const SEED_OFFSET = PKCS8_HEADER.length;

interface Props extends RouteComponentProps<{address: string}>, ThemeProps {
  className?: string;
}

function PrivateKey ({ className, match: { params: { address } } }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const [isBusy, setIsBusy] = useState(false);
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [privateKey, setPrivateKey] = useState('');

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

  const displayPrivateKey = useCallback(
    (jsonData: string) => {
      setPrivateKey(jsonData);
    }
    , []);

  const _onExportButtonClick = useCallback(
    (): void => {
      setIsBusy(true);

      exportAccount(address, pass)
        .then(({ exportedJson }) => {
          const decrypted = jsonDecrypt(exportedJson, pass);
          const header = decrypted.subarray(0, PKCS8_HEADER.length);

          if (!u8aEq(header, PKCS8_HEADER)) {
            // throw new Error('Invalid Pkcs8 header found in body');
            setError('Encountered some error');
          }

          let secretKey = decrypted.subarray(SEED_OFFSET, SEED_OFFSET + SEC_LENGTH);
          let divOffset = SEED_OFFSET + SEC_LENGTH;
          let divider = decrypted.subarray(divOffset, divOffset + PKCS8_DIVIDER.length);

          if (!u8aEq(divider, PKCS8_DIVIDER)) {
            divOffset = SEED_OFFSET + SEED_LENGTH;
            secretKey = decrypted.subarray(SEED_OFFSET, divOffset);
            divider = decrypted.subarray(divOffset, divOffset + PKCS8_DIVIDER.length);

            if (!u8aEq(divider, PKCS8_DIVIDER)) {
              throw new Error('Invalid Pkcs8 divider found in body');
            }
          }

          const pubOffset = divOffset + PKCS8_DIVIDER.length;
          const publicKey = decrypted.subarray(pubOffset, pubOffset + PUB_LENGTH);
          const combinedPublicAndSecretKey = new Uint8Array([...publicKey, ...secretKey]);

          const pk = u8aToHex(combinedPublicAndSecretKey); // NOTE - to create keypair from pk , we need to extract public and secret key like this
          /*
            const publicKey = u8aToHex(hexToU8a(pk).slice(0,32));
            const secretKey = hexToU8a(pk).slice(32,pk.length)
            const pair = keyring.createFromPair({publicKey,secretKey}, {}, 'sr25519');
        */

          displayPrivateKey(pk);
        })
        .catch((error: Error) => {
          console.error(error);
          setError(error.message);
          setIsBusy(false);
        });
    },
    [address, pass, displayPrivateKey]
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
          {privateKey === '' && (
            <Warning className='movedWarning'>
              {t<string>("You are exporting your account. Keep it safe and don't share it with anyone.")}<br />
              {t<string>('Password must be at least ' + MIN_LENGTH + ' characters long.')}
            </Warning>
          )}
          <div className='actionArea'>
            {privateKey === '' && (
              <InputWithLabel
                data-export-password
                disabled={isBusy}
                isError={pass.length < MIN_LENGTH || !!error}
                label={t<string>('password for this account')}
                onChange={onPassChange}
                type='password'
              />)}
            {privateKey !== '' && (

              <CopyToClipboard text={(privateKey)}>

                <div>
                  <div style={{ display: 'flex' }}>
                    <div>Private Key</div>
                    <div
                      className='pk-copy-btn'
                      onClick={() => notify.info({
                        aliveFor: 2,
                        message: 'Copied Private Key to Clipboard.'
                      })}>
                      <FontAwesomeIcon
                        className='copyIcon'
                        icon={faCopy as IconProp}
                        size='sm'
                        title={t('Copy Private Key')}

                      />
                    </div>
                  </div>
                  <div
                    style={{
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      maxWidth: '-webkit-fill-available',
                      padding: '8px',
                      border: '1px solid #373840',
                      borderRadius: '4px',
                      backgroundColor: '#373840'
                    }}
                  >
                    {privateKey}
                  </div>
                </div>
              </CopyToClipboard>

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
      {privateKey === '' && (
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
            {t<string>('I want to export private key of this account')}
          </Button>
        </ButtonArea>
      )}
    </>
  );
}

export default withRouter(styled(PrivateKey)`
  margin-top: 15px;
  .actionArea {
    padding: 10px 24px;
  }

  .movedWarning {
    margin-top: 8px;
  }
`);
