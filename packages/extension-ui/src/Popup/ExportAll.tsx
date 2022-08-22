// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../types';

import Uik from '@reef-defi/ui-kit';
import { saveAs } from 'file-saver';
import React, { useCallback, useContext, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import styled from 'styled-components';

import { AccountContext, ActionContext, ActionText, ButtonArea, InputWithLabel, VerticalSpace, Warning } from '../components';
import useTranslation from '../hooks/useTranslation';
import { exportAccounts } from '../messaging';
import { Header } from '../partials';

const MIN_LENGTH = 6;

interface Props extends RouteComponentProps, ThemeProps {
  className?: string;
}

function ExportAll ({ className }): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const onAction = useContext(ActionContext);
  const [isBusy, setIsBusy] = useState(false);
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

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

  const _onExportAllButtonClick = useCallback(
    (): void => {
      setIsBusy(true);

      exportAccounts(accounts.map((account) => account.address), pass)
        .then(({ exportedJson }) => {
          const blob = new Blob([JSON.stringify(exportedJson)], { type: 'application/json; charset=utf-8' });

          saveAs(blob, `batch_exported_account_${Date.now()}.json`);

          onAction('/');
        })
        .catch((error: Error) => {
          console.error(error);
          setError(error.message);
          setIsBusy(false);
        });
    },
    [accounts, onAction, pass]
  );

  return (
    <>
      <Header
        showLogo
        text={t<string>('Export all accounts')}>
        <div className='steps'>
          <ActionText
            onClick={_goHome}
            text='Cancel'
          />
        </div>
      </Header>
      <div className={className}>
        <Warning className='movedWarning'>
          {t<string>("You are exporting your accounts. Keep it safe and don't share it with anyone.")}<br />
          {t<string>('Password must be at least ' + MIN_LENGTH + ' characters long.')}
        </Warning>
        <InputWithLabel
          data-export-all-password
          disabled={isBusy}
          isError={pass.length < MIN_LENGTH || !!error}
          label={t<string>('password for encrypting all accounts')}
          onChange={onPassChange}
          type='password'
        />
        {error && (
          <Warning
            isBelowInput
            isDanger
          >
            {error}
          </Warning>
        )}
      </div>
      <VerticalSpace />
      <ButtonArea>
        <Uik.Button
          className='uik-button--fullWidth export-button'
          rounded
          danger
          size='large'
          data-export-button
          disabled={pass.length < MIN_LENGTH || !!error}
          loading={isBusy}
          onClick={_onExportAllButtonClick}>
          {t<string>('I want to export all my accounts')}
        </Uik.Button>
      </ButtonArea>
    </>
  );
}

export default withRouter(styled(ExportAll)`
  margin-top: 15px;
  .movedWarning {
    margin-bottom: 8px;
  }
`);
