// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Uik from '@reef-defi/ui-kit';
import React, { useCallback, useState } from 'react';

import { Name, Password } from '../partials';
import { ButtonArea, VerticalSpace } from '.';

interface Props {
  buttonLabel: string;
  isBusy: boolean;
  onBackClick: () => void;
  onCreate: (name: string, password: string) => void | Promise<void | boolean>;
  onNameChange: (name: string) => void;
}

function AccountNamePasswordCreation ({ buttonLabel, isBusy, onBackClick, onCreate, onNameChange }: Props): React.ReactElement<Props> {
  const [name, setName] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);

  const _onCreate = useCallback(
    () => name && password && onCreate(name, password),
    [name, password, onCreate]
  );

  const _onNameChange = useCallback(
    (name: string | null) => {
      onNameChange(name || '');
      setName(name);
    },
    [onNameChange]
  );

  const _onBackClick = useCallback(
    () => {
      _onNameChange(null);
      setPassword(null);
      onBackClick();
    },
    [_onNameChange, onBackClick]
  );

  return (
    <>
      <Name
        isFocused
        onChange={_onNameChange}
      />
      <Password onChange={setPassword} />
      <VerticalSpace />
      <ButtonArea>
        <Uik.Button
          icon={faArrowLeft}
          size='large'
          onClick={_onBackClick}
        />
        <Uik.Button
          data-button-action='add new root'
          className='uik-button--fullWidth'
          rounded
          fill
          size='large'
          icon={faArrowRight}
          iconPosition='right'
          disabled={!password || !name}
          loading={isBusy}
          onClick={_onCreate}>
          {buttonLabel}
        </Uik.Button>
      </ButtonArea>
    </>
  );
}

export default React.memo(AccountNamePasswordCreation);
