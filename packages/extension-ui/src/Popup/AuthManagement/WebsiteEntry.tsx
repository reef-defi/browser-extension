// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../../types';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AuthUrlInfo } from '@reef-defi/extension-base/background/handlers/State';
import { Switch } from '@reef-defi/extension-ui/components';
import React, { useCallback } from 'react';
import styled from 'styled-components';

import useTranslation from '../../hooks/useTranslation';

interface Props extends ThemeProps {
  className?: string;
  info: AuthUrlInfo;
  toggleAuth: (url: string) => void
  removeAuth: (url: string) => void
  url: string;
}

function WebsiteEntry ({ className = '', info, removeAuth, toggleAuth, url }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const switchAccess = useCallback(() => {
    toggleAuth(url);
  }, [toggleAuth, url]);

  const removeAccess = useCallback(() => {
    removeAuth(url);
  }, [removeAuth, url]);

  return (
    <div className={`${className} ${info.isAllowed ? 'allowed' : 'denied'}`}>
      <div className='url'>
        {url}
      </div>
      <Switch
        checked={info.isAllowed}
        checkedLabel={t<string>('allowed')}
        className='info'
        onChange={switchAccess}
        uncheckedLabel={t<string>('denied')}
      />

      <FontAwesomeIcon
        onClick={removeAccess}
        className='remove-access'
        icon={faTrash as IconProp} />
    </div>
  );
}

export default styled(WebsiteEntry)(({ theme }: Props) => `
  display: flex;
  align-items: center;

  .url{
    flex: 1;
  }

  &.denied {
    .slider::before {
        background-color: ${theme.backButtonBackground};
      }
  }
  
  .remove-access {
    margin-left: 12px;
    cursor: pointer;
    color: ${theme.primaryColor}
  }
`);
