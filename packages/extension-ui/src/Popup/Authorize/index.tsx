// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../../types';

import React, { useContext } from 'react';
import styled from 'styled-components';

import { AuthorizeReqContext } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import { Header } from '../../partials';
import Request from './Request';

interface Props extends ThemeProps {
  className?: string;
}

function Authorize ({ className = '' }: Props): React.ReactElement {
  const { t } = useTranslation();
  const requests = useContext(AuthorizeReqContext);

  return (
    <>
      <Header
        showLogo
        text={t<string>('Authorize')}>
        {requests.length > 1 && (<div className='steps'>
          <div>
            <span className='current'>1</span>
            <span className='total'>/{requests.length}</span>
          </div>
        </div>)}
      </Header>

      <div className='authorize__requests'>
        {requests.map(({ id, request, url }, index): React.ReactNode => (
          <div
            className='authorize__request'
            key={id}>
            <Request
              authId={id}
              className={`request ${className} ${requests.length === 1 ? 'lastRequest' : ''}`}
              isFirst={index === 0}
              request={request}
              key={id}
              url={url}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export default styled(Authorize)`
  overflow-y: auto;

  && {
    padding: 0;
  }
`;
