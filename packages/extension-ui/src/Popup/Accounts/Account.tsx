// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@reef-defi/extension-base/background/types';

import { canDerive } from '@reef-defi/extension-base/utils';
import { ThemeProps } from '@reef-defi/extension-ui/types';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { Address, Dropdown, Link, MenuDivider } from '../../components';
import useGenesisHashOptions from '../../hooks/useGenesisHashOptions';
import useTranslation from '../../hooks/useTranslation';
import { editAccount, tieAccount } from '../../messaging';
import { Name } from '../../partials';

interface Props extends AccountJson {
  className?: string;
  parentName?: string;
}

interface EditState {
  isEditing: boolean;
  toggleActions: number;
}

function Account ({ address, className, genesisHash, isExternal, isHardware, isHidden, name, parentName, suri, type }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [{ isEditing, toggleActions }, setEditing] = useState<EditState>({ isEditing: false, toggleActions: 0 });
  const [editedName, setName] = useState<string | undefined | null>(name);
  const genesisOptions = useGenesisHashOptions();

  const _onChangeGenesis = useCallback(
    (genesisHash?: string | null): void => {
      tieAccount(address, genesisHash || null)
        .catch(console.error);
    },
    [address]
  );

  const _toggleEdit = useCallback(
    (ev?: Event): void => {
      ev?.preventDefault();
      console.log('edit=', ev);
      setEditing(({ toggleActions }) => ({ isEditing: !isEditing, toggleActions: ++toggleActions }));
    },
    [isEditing]
  );

  const _saveChanges = useCallback(
    (): void => {
      editedName &&
        editAccount(address, editedName)
          .catch(console.error);

      _toggleEdit();
    },
    [editedName, address, _toggleEdit]
  );

  const _actions = useMemo(() => (
    <>
      <Link
        className='menuItem'
        onClick={_toggleEdit}
      >
        {t<string>('Rename')}
      </Link>
      {!isExternal && canDerive(type) && (
        <Link
          className='menuItem'
          to={`/account/derive/${address}/locked`}
        >
          {t<string>('Derive New Account')}
        </Link>
      )}
      <MenuDivider />
      {!isExternal && (
        <Link
          className='menuItem'
          isDanger
          to={`/account/export/${address}`}
        >
          {t<string>('Export Account')}
        </Link>
      )}
      <Link
        className='menuItem'
        isDanger
        to={`/account/forget/${address}`}
      >
        {t<string>('Forget Account')}
      </Link>
      {!isHardware && (
        <>
          <MenuDivider />
          <div className='menuItem'>
            <Dropdown
              className='genesisSelection'
              label=''
              onChange={_onChangeGenesis}
              options={genesisOptions}
              value={genesisHash || ''}
            />
          </div>
        </>
      )}
    </>
  ), [_onChangeGenesis, _toggleEdit, address, genesisHash, genesisOptions, isExternal, isHardware, t, type]);

  return (
    <div className={`${className || ''} account-card`}>
      <Address
        actions={_actions}
        address={address}
        className='address'
        genesisHash={genesisHash}
        isExternal={isExternal}
        isHidden={isHidden}
        name={editedName}
        parentName={parentName}
        suri={suri}
        toggleActions={toggleActions}
      >
        {isEditing && (
          <Name
            address={address}
            className={`account-card__rename editName ${parentName ? 'withParent' : ''}`}
            isFocused
            label={' '}
            onBlur={_saveChanges}
            onChange={setName}
          />
        )}
      </Address>
    </div>
  );
}

export default styled(Account)(({ theme }: ThemeProps) => `
  .address {
    margin-bottom: 8px;
  }

  .editName {
    position: absolute;
    flex: 1;
    left: 70px;
    top: 10px;
    width: 350px;

    .danger {
      background-color: ${theme.bodyColor};
      margin-top: -13px;
      width: 330px;
    }

    input {
      height : 30px;
      width: 350px;
    }

    &.withParent {
      top: 16px
    }
  }

  .menuItem {
    border-radius: 8px;
    display: block;
    font-size: 15px;
    line-height: 20px;
    margin: 0;
    min-width: 13rem;
    padding: 4px 16px;

    .genesisSelection {
      margin: 0;
    }
  }
`);
