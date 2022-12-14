// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../../types';

import { AccountWithChildren } from '@reef-defi/extension-base/background/types';
import Account from '@reef-defi/extension-ui/Popup/Accounts/Account';
import getNetworkMap from '@reef-defi/extension-ui/util/getNetworkMap';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { AccountContext } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import { Header } from '../../partials';
import AccountsTree from './AccountsTree';
import AddAccount from './AddAccount';

interface Props extends ThemeProps {
  className?: string;
}

function Accounts ({ className }: Props): React.ReactElement {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');
  const [filteredAccount, setFilteredAccount] = useState<AccountWithChildren[]>([]);
  const { hierarchy, selectedAccount } = useContext(AccountContext);
  const networkMap = useMemo(() => getNetworkMap(), []);

  useEffect(() => {
    const filterChildren = (hierarchy: AccountWithChildren[], filter: string): AccountWithChildren[] => {
      const flattenHierarchy = (accounts: AccountWithChildren[], list: AccountWithChildren[]): AccountWithChildren[] => {
        accounts.forEach(function (account) {
          list.push(account);

          if (account.children) {
            list.concat(flattenHierarchy(account.children, list));
          }
        });

        return list;
      };

      const list = flattenHierarchy(hierarchy, []);

      return list.filter((account) =>
        account.name?.toLowerCase().includes(filter) ||
        (account.genesisHash && networkMap.get(account.genesisHash)?.toLowerCase().includes(filter))
      );
    };

    setFilteredAccount(
      filter
        ? filterChildren(hierarchy, filter)
        : hierarchy
    );
  }, [filter, hierarchy, networkMap]);

  const _onFilter = useCallback((filter: string) => {
    setFilter(filter.toLowerCase());
  }, []);

  return (
    <>
      {(hierarchy.length === 0)
        ? <AddAccount />
        : (
          <>
            <h3>Selected</h3>
            <Account
              {...selectedAccount}
              /* parentName = {parentName}
                suri={suri} */
            />
            <Header
              onFilter={_onFilter}
              showSearch
              text={t<string>('Accounts')}
            />
            <div className={className}>
              {filteredAccount.map((json, index): React.ReactNode => (
                <AccountsTree
                  {...json}
                  key={`${index}:${json.address}`}
                />
              ))}
            </div>
          </>
        )
      }
    </>
  );
}

export default styled(Accounts)`
  height: calc(100vh - 2px);
  overflow-y: scroll;
  padding-top: 12px;
  padding-bottom: 15px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;
