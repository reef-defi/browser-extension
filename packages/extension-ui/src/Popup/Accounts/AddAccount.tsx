// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../../types';

import { ActionContext } from '@reef-defi/extension-ui/components';
import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';

import { Button } from '../../../../reef/extension-ui/uik/Button';
import { ButtonArea } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import Header from '../../partials/Header';
import AddAccountImage from './AddAccountImage';

interface Props extends ThemeProps {
  className?: string;
}

function AddAccount ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const _onClickCreate = useCallback(
    () => onAction('/account/create'),
    [onAction]
  );
  const _onClickImport = useCallback(
    () => onAction('/account/import-seed'),
    [onAction]
  );

  return (
    <>
      <Header
        showSettings
        showLogo
        text={t<string>('Add Account')}
      />
      <div className={className}>
        <div className='image'>
          <AddAccountImage onClick={_onClickCreate} />
        </div>
        <div className='no-accounts'>
          <p>{t<string>("You currently don't have any accounts. Create your first account to get started. Or import if you already have an account.")}</p>
        </div>
      </div>
      <ButtonArea>
        <Button
          className='uik-button--fullWidth'
          rounded
          fill
          size='large'
          onClick={_onClickCreate}>
          {t<string>('Create account')}
        </Button>
        <Button
          rounded
          size='large'
          onClick={_onClickImport}>
          {t<string>('Import account')}
        </Button>
      </ButtonArea>
    </>
  );
}

export default React.memo(styled(AddAccount)(({ theme }: Props) => `
  color: ${theme.textColor};
  height: 100%;

  h3 {
    color: ${theme.textColor};
    margin-top: 0;
    font-weight: normal;
    font-size: 24px;
    line-height: 33px;
    text-align: center;
  }

  > .image {
    display: flex;
    justify-content: center;
  }

  > .no-accounts p {
    text-align: center;
    font-size: 15px;
    line-height: 1.5;
    margin: 0 30px;
    color: ${theme.subTextColor};
  }
`));
