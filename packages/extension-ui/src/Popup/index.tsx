// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson, AccountsContext, AuthorizeRequest, MetadataRequest, SigningRequest } from '@reef-defi/extension-base/background/types';
import type { SettingsStruct } from '@polkadot/ui-settings/types';

import { Provider } from '@reef-defi/evm-provider';
import { PHISHING_PAGE_REDIRECT } from '@reef-defi/extension-base/defaults';
import { canDerive } from '@reef-defi/extension-base/utils';
import { appState, hooks, graphql, ReefSigner } from '@reef-defi/react-lib';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Route, Switch } from 'react-router';

import uiSettings from '@polkadot/ui-settings';

import { Bind } from '../../../reef/extension-ui/components/Bind';
import { Dashboard } from '../../../reef/extension-ui/components/dashboard/Dashboard';
import { HeaderComponent } from '../../../reef/extension-ui/components/HeaderComponent';
import { Swap } from '../../../reef/extension-ui/components/Swap';
import { Transfer } from '../../../reef/extension-ui/components/Transfer';
import { useReefSigners } from '../../../reef/extension-ui/hooks/useReefSigners';
import { ErrorBoundary, Loading } from '../components';
import { AccountContext, ActionContext, AuthorizeReqContext, MediaContext, MetadataReqContext, SettingsContext, SigningReqContext, TokenContext, TokenPricesContext, PoolContext } from '../components/contexts';
import ToastProvider from '../components/Toast/ToastProvider';
import { subscribeAccounts, subscribeAuthorizeRequests, subscribeMetadataRequests, subscribeSigningRequests } from '../messaging';
import { buildHierarchy } from '../util/buildHierarchy';
import Accounts from './Accounts';
import AuthList from './AuthManagement';
import Authorize from './Authorize';
import CreateAccount from './CreateAccount';
import Derive from './Derive';
import Export from './Export';
import ExportAll from './ExportAll';
import Forget from './Forget';
import ImportLedger from './ImportLedger';
import ImportQr from './ImportQr';
import ImportSeed from './ImportSeed';
import Metadata from './Metadata';
import PhishingDetected from './PhishingDetected';
import RestoreJson from './RestoreJson';
import Signing from './Signing';
import Welcome from './Welcome';
import { ApolloProvider, ApolloClient } from '@apollo/client';
import {ReefContext} from "../../../reef/extension-ui/components/ReefContext";

const startSettings = uiSettings.get();

// Request permission for video, based on access we can hide/show import
async function requestMediaAccess (cameraOn: boolean): Promise<boolean> {
  if (!cameraOn) {
    return false;
  }

  try {
    await navigator.mediaDevices.getUserMedia({ video: true });

    return true;
  } catch (error) {
    console.error('Permission for video declined', (error as Error).message);
  }

  return false;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function initAccountContext (accounts: AccountJson[], selectedAccount: AccountJson|null): AccountsContext {
  const hierarchy = buildHierarchy(accounts);
  const master = hierarchy.find(({ isExternal, type }) => !isExternal && canDerive(type));

  return {
    accounts,
    hierarchy,
    master
  };
}

export default function Popup (): React.ReactElement {
  const [accounts, setAccounts] = useState<null | AccountJson[]>(null);
  const provider: Provider|undefined = hooks.useObservableState(appState.currentProvider$);
  const signers = useReefSigners(accounts, provider);

  hooks.useInitReefState('Reef Chain Extension', { signers });
  const [accountCtx, setAccountCtx] = useState<AccountsContext>({ accounts: [], hierarchy: [] });
  const [authRequests, setAuthRequests] = useState<null | AuthorizeRequest[]>(null);
  const [cameraOn, setCameraOn] = useState(startSettings.camera === 'on');
  const [mediaAllowed, setMediaAllowed] = useState(false);
  const [metaRequests, setMetaRequests] = useState<null | MetadataRequest[]>(null);
  const [signRequests, setSignRequests] = useState<null | SigningRequest[]>(null);
  const [isWelcomeDone, setWelcomeDone] = useState(false);
  const [settingsCtx, setSettingsCtx] = useState<SettingsStruct>(startSettings);

  const currentSigner: ReefSigner | undefined | null = hooks.useObservableState(appState.selectedSigner$);
  const apollo: ApolloClient<any> | undefined = hooks.useObservableState(graphql.apolloClientInstance$);

  const _onAction = useCallback(
    (to?: string): void => {
      setWelcomeDone(window.localStorage.getItem('welcome_read') === 'ok');

      if (to) {
        window.location.hash = to;
      }
    },
    []
  );

  useEffect((): void => {
    Promise.all([
      subscribeAccounts(setAccounts),
      subscribeAuthorizeRequests(setAuthRequests),
      subscribeMetadataRequests(setMetaRequests),
      subscribeSigningRequests(setSignRequests)
    ]).catch(console.error);

    uiSettings.on('change', (settings): void => {
      setSettingsCtx(settings);
      setCameraOn(settings.camera === 'on');
    });

    _onAction();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect((): void => {
    setAccountCtx(initAccountContext(accounts || [], null));
  }, [accounts]);

  useEffect((): void => {
    requestMediaAccess(cameraOn)
      .then(setMediaAllowed)
      .catch(console.error);
  }, [cameraOn]);

  function wrapWithErrorBoundary (component: React.ReactElement, trigger?: string): React.ReactElement {
    return <ErrorBoundary trigger={trigger}>{component}</ErrorBoundary>;
  }

  const Root = isWelcomeDone
    ? authRequests && authRequests.length
      ? wrapWithErrorBoundary(<Authorize />, 'authorize')
      : metaRequests && metaRequests.length
        ? wrapWithErrorBoundary(<Metadata />, 'metadata')
        : signRequests && signRequests.length
          ? wrapWithErrorBoundary(<Signing />, 'signing')
          : wrapWithErrorBoundary(<Accounts />, 'accounts')
    : wrapWithErrorBoundary(<Welcome />, 'welcome');

  return (
    <Loading>{accounts && authRequests && metaRequests && signRequests && apollo && (
      <ActionContext.Provider value={_onAction}>
        <SettingsContext.Provider value={settingsCtx}>
          <AccountContext.Provider value={accountCtx}>
            <AuthorizeReqContext.Provider value={authRequests}>
              <MediaContext.Provider value={cameraOn && mediaAllowed}>
                <MetadataReqContext.Provider value={metaRequests}>
                  <SigningReqContext.Provider value={signRequests}>
                    <ApolloProvider client={apollo}>
                      <ReefContext apollo={apollo} signer={ currentSigner}>
                        <ToastProvider>
                          <HeaderComponent></HeaderComponent>
                          <Switch>
                            <Route path='/auth-list'>{wrapWithErrorBoundary(<AuthList />, 'auth-list')}</Route>
                            <Route path='/account/create'>{wrapWithErrorBoundary(<CreateAccount />, 'account-creation')}</Route>
                            <Route path='/account/forget/:address'>{wrapWithErrorBoundary(<Forget />, 'forget-address')}</Route>
                            <Route path='/account/export/:address'>{wrapWithErrorBoundary(<Export />, 'export-address')}</Route>
                            <Route path='/account/export-all'>{wrapWithErrorBoundary(<ExportAll />, 'export-all-address')}</Route>
                            <Route path='/account/import-ledger'>{wrapWithErrorBoundary(<ImportLedger />, 'import-ledger')}</Route>
                            <Route path='/account/import-qr'>{wrapWithErrorBoundary(<ImportQr />, 'import-qr')}</Route>
                            <Route path='/account/import-seed'>{wrapWithErrorBoundary(<ImportSeed />, 'import-seed')}</Route>
                            <Route path='/account/restore-json'>{wrapWithErrorBoundary(<RestoreJson />, 'restore-json')}</Route>
                            <Route path='/account/derive/:address/locked'>{wrapWithErrorBoundary(<Derive isLocked />, 'derived-address-locked')}</Route>
                            <Route path='/account/derive/:address'>{wrapWithErrorBoundary(<Derive />, 'derive-address')}</Route>
                            <Route path='/transfer'>{wrapWithErrorBoundary(<Transfer />, 'transfer')}</Route>
                            <Route path='/accounts'>{wrapWithErrorBoundary(<Accounts className='content-comp' />, 'accounts')}</Route>
                            <Route path='/tokens'>{wrapWithErrorBoundary(<Dashboard />, 'tokens')}</Route>
                            <Route path='/swap'>{wrapWithErrorBoundary(<Swap />, 'swap')}</Route>
                            <Route path='/bind'>{wrapWithErrorBoundary(<Bind />, 'bind')}</Route>
                            <Route path={`${PHISHING_PAGE_REDIRECT}/:website`}>{wrapWithErrorBoundary(<PhishingDetected />, 'phishing-page-redirect')}</Route>
                            <Route
                              exact
                              path='/'
                            >
                              {Root}
                            </Route>
                          </Switch>
                        </ToastProvider>
                      </ReefContext>
                    </ApolloProvider>
                  </SigningReqContext.Provider>
                </MetadataReqContext.Provider>
              </MediaContext.Provider>
            </AuthorizeReqContext.Provider>
          </AccountContext.Provider>
        </SettingsContext.Provider>
      </ActionContext.Provider>
    )}</Loading>
  );
}
