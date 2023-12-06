// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../types';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useContext } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import styled from 'styled-components';

import { ActionContext, Address, VerticalSpace,  } from '../components';
import useTranslation from '../hooks/useTranslation';
import { Header } from '../partials';
import QRCodeComponent from '../partials/QrCodeComponent';


interface Props extends RouteComponentProps<{address: string}>, ThemeProps {
  className?: string;
}

function AddressQr ({ className, match: { params: { address } } }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);

  const _goHome = useCallback(
    () => onAction('/'),
    [onAction]
  );


  return (
    <>
      <Header
        showLogo
        text={t<string>('Account QR')}>
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
           <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <QRCodeComponent value={address} size={256}/>
        </div>
        </Address>
      </div>
      <VerticalSpace />
    </>
  );
}

export default withRouter(styled(AddressQr)`
  margin-top: 15px;
  .actionArea {
    padding: 10px 24px;
  }

  .movedWarning {
    margin-top: 8px;
  }
`);
