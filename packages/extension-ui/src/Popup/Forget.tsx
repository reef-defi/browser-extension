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
import { ActionContext, Address, ButtonArea, VerticalSpace, Warning } from '../components';
import useTranslation from '../hooks/useTranslation';
import { forgetAccount } from '../messaging';
import { Header } from '../partials';

interface Props extends RouteComponentProps<{ address: string }>, ThemeProps {
  className?: string;
}

function Forget ({ className, match: { params: { address } } }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const [isBusy, setIsBusy] = useState(false);

  const _goHome = useCallback(
    () => onAction('/'),
    [onAction]
  );

  const _onClick = useCallback(
    (): void => {
      setIsBusy(true);
      forgetAccount(address)
        .then(() => {
          setIsBusy(false);
          onAction('/');
        })
        .catch((error: Error) => {
          setIsBusy(false);
          console.error(error);
        });
    },
    [address, onAction]
  );

  return (
    <>
      <Header
        showLogo
        text={t<string>('Forget account')}>
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
          <Warning className='movedWarning'>
            {t<string>('You are about to remove the account. This means that you will not be able to access it via this extension anymore. If you wish to recover it, you would need to use the seed.')}
          </Warning>
        </Address>
      </div>
      <VerticalSpace />
      <ButtonArea>
        <Button
          className='uik-button--fullWidth export-button'
          rounded
          danger
          size='large'
          loading={isBusy}
          onClick={_onClick}>
          {t<string>('I want to forget this account')}
        </Button>
      </ButtonArea>
    </>
  );
}

export default withRouter(styled(Forget)`
  margin-top: 15px;
  .movedWarning {
    margin-top: 8px;
  }
`);
