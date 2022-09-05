// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../../types';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useState } from 'react';
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
  const [requestIndex, setRequestIndex] = useState(0);

  function handleRequestIndexLoop (index: number): number {
    if (index < 0) {
      return requests.length - 1;
    }

    if (index < requests.length) {
      return index;
    }

    return 0;
  }

  return (
    <>
      <Header
        showLogo
        text={t<string>('Authorize')}>
        {requests.length > 1 && (<div className='steps'>
          <div>
            <FontAwesomeIcon
              className='steps__arrow'
              icon={faArrowLeft as IconProp}
              onClick={() => setRequestIndex(handleRequestIndexLoop(requestIndex + 1))} />
            <span className='current'>{requestIndex + 1}</span>
            <span className='total'>/{requests.length}</span>
            <FontAwesomeIcon
              icon={faArrowRight as IconProp}
              className='steps__arrow'
              onClick={() => setRequestIndex(handleRequestIndexLoop(requestIndex - 1))} />
          </div>
        </div>)}
      </Header>

      <div className='authorize__requests'>
        {requests.map(({ id, request, url }, index): React.ReactNode => (
          <div
            className={`authorize__request ${index === requestIndex ? 'request--top' : ''}`}
            key={id}>
            <Request
              authId={id}
              className={`request ${className}`}
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
