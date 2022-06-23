// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountsContext, AuthorizeRequest, MetadataRequest, SigningRequest } from '@reef-defi/extension-base/background/types';
import type { SettingsStruct } from '@polkadot/ui-settings/types';
import type { AvailableThemes } from './themes';

import { LastPoolReserves, Token } from '@reef-defi/react-lib';
import React from 'react';

import settings from '@polkadot/ui-settings';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const noop = (): void => undefined;

type TokenPrices = {
  [address: string]: number;
}

const AccountContext = React.createContext<AccountsContext>({ accounts: [], hierarchy: [], master: undefined, selectedAccount: null });
const ActionContext = React.createContext<(to?: string) => void>(noop);
const AuthorizeReqContext = React.createContext<AuthorizeRequest[]>([]);
const MediaContext = React.createContext<boolean>(false);
const MetadataReqContext = React.createContext<MetadataRequest[]>([]);
const SettingsContext = React.createContext<SettingsStruct>(settings.get());
const SigningReqContext = React.createContext<SigningRequest[]>([]);
const ThemeSwitchContext = React.createContext<(theme: AvailableThemes) => void>(noop);
const ToastContext = React.createContext<({show: (message: string) => void})>({ show: noop });
const TokenContext = React.createContext<Token[]>([]);
const TokenPricesContext = React.createContext<TokenPrices>({});
const PoolContext = React.createContext<LastPoolReserves[]>([]);

export {
  AccountContext,
  ActionContext,
  AuthorizeReqContext,
  MediaContext,
  MetadataReqContext,
  SettingsContext,
  SigningReqContext,
  ThemeSwitchContext,
  ToastContext,
  TokenContext,
  TokenPricesContext,
  PoolContext
};
