// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../types';

import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';

import { Button } from '../../../reef/extension-ui/uik/Button';
import { ActionContext, ButtonArea, VerticalSpace, Warning } from '../components';
import useTranslation from '../hooks/useTranslation';
import { Header } from '../partials';

interface Props extends ThemeProps {
  className?: string;
}

const Welcome = function ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);

  const _onClick = useCallback(
    (): void => {
      window.localStorage.setItem('welcome_read', 'ok');
      onAction();
    },
    [onAction]
  );

  return (
    <>
      <Header
        showLogo
        text={t<string>('Welcome')}
      />
      <div className={className}>
        <p>{t<string>('Before we start, just a couple of notes regarding use:')}</p>
        <Warning className='warningMargin'>
          {t<string>('We do not send any clicks, pageviews or events to a central server')}<br /><br />
          {t<string>('We do not use any trackers or analytics')}<br /><br />
          {t<string>("We don't collect keys, addresses or any information - your information never leaves this machine")}
        </Warning>
        <p>{t<string>('... we are not in the information collection business (even anonymized).')}</p>
      </div>
      <VerticalSpace />
      <ButtonArea>
        <Button
          className='uik-button--fullWidth export-button'
          rounded
          fill
          size='large'
          onClick={_onClick}>
          {t<string>('Understood, let me continue')}
        </Button>
      </ButtonArea>
    </>
  );
};

export default styled(Welcome)(() => `
  p {
    margin-top: 15px;
  }

  .warningMargin {
    margin: 24px 24px 0 1.45rem;
  }
`);
