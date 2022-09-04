// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RequestAuthorizeTab } from '@reef-defi/extension-base/background/types';
import type { ThemeProps } from '../../types';

import React, { useCallback, useContext } from 'react';
import { Trans } from 'react-i18next';
import styled from 'styled-components';

import { Button } from '../../../../reef/extension-ui/uik/Button';
import { ActionContext, ButtonArea, VerticalSpace, Warning } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import { approveAuthRequest, rejectAuthRequest } from '../../messaging';

interface Props extends ThemeProps {
  authId: string;
  className?: string;
  isFirst: boolean;
  request: RequestAuthorizeTab;
  url: string;
}

function Request ({ authId, className, isFirst, request: { origin }, url }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);

  const _onApprove = useCallback(
    () => approveAuthRequest(authId)
      .then(() => onAction())
      .catch((error: Error) => console.error(error)),
    [authId, onAction]
  );

  const _onReject = useCallback(
    () => rejectAuthRequest(authId)
      .then(() => onAction())
      .catch((error: Error) => console.error(error)),
    [authId, onAction]
  );

  return (
    <>
      <div className={className}>
        <div className='tab-info'>
          <Trans key='accessRequest'>An application, self-identifying as <span className='tab-name'>{origin}</span> is requesting access from{' '}
            <a
              href={url}
              rel='noopener noreferrer'
              target='_blank'
            >
              <span className='tab-url'>{url}</span>
            </a>.
          </Trans>
        </div>
        {(
          <Warning className='warningMargin'>
            {t<string>('Only approve this request if you trust the application. Approving gives the application access to the addresses of your accounts.')}
          </Warning>
        )}
      </div>
      <VerticalSpace />
      <ButtonArea>
        <Button
          rounded
          danger
          size='large'
          onClick={_onReject}>
          {t<string>('Reject')}
        </Button>
        <Button
          className='uik-button--fullWidth'
          rounded
          fill
          size='large'
          onClick={_onApprove}>
          {t<string>('Yes, allow this application access')}
        </Button>
      </ButtonArea>
    </>
  );
}

export default styled(Request)(({ theme }: Props) => `
  height: 100%;
  .tab-info {
    overflow: hidden;
    margin: 24px 24px 0px 1.45rem;
    
  }

  .tab-name,
  .tab-url {
    color: ${theme.textColor};
    display: inline-block;
    max-width: 20rem;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: top;
    cursor: pointer;
    text-decoration: underline;
  }

  .info {
    display: flex;
    flex-direction: row;
  }

  .warningMargin {
    margin: 24px 24px 0 1.45rem;
  }

`);
