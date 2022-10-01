// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../types';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';

import { ActionContext } from '../components';
import Header from './Header';

interface Props extends ThemeProps {
  className?: string;
  step: number;
  text: string;
}

function HeaderWithSteps ({ className, step, text }: Props): React.ReactElement<Props> {
  const onAction = useContext(ActionContext);

  const _onCancel = useCallback(() => {
    onAction('/');
  }, [onAction]);

  return (
    <Header
      showLogo
      className={className}
      text={text}
    >
      <div className='steps'>
        <div>
          <span className='current'>{step}</span>
          <span className='total'>/2</span>
        </div>

        <button
          className='popup__close-btn'
          type='button'
          onClick={_onCancel}>
          <FontAwesomeIcon
            className='popup__close-btn-icon'
            icon={faTimes as IconProp}
            title='Close'
          />
        </button>
      </div>
    </Header>
  );
}

export default React.memo(styled(HeaderWithSteps)(({ theme }: Props) => `
  & {
    margin-bottom: 20px;
  }

  .current {
    font-size: ${theme.labelFontSize};
    line-height: ${theme.labelLineHeight};
    color: ${theme.primaryColor};
  }

  .steps {
    align-items: center;
    display: flex;
    justify-content: space-between;
    flex-grow: 1;
    padding-left: 1em;
  }

  .total {
    font-size: ${theme.labelFontSize};
    line-height: ${theme.labelLineHeight};
    color: ${theme.textColor};
  }
`));
