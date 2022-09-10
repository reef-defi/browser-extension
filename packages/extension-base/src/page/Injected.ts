// Copyright 2019-2021 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Injected } from '@reef-defi/extension-inject/types';
import type { SendRequest } from './types';

import Accounts from '@reef-defi/extension-base/page/Accounts';

import { ReefInjectedProvider } from '../../../reef/extension-base/src/page/ReefInjectedProvider';
import { ReefInjectedSigner } from '../../../reef/extension-base/src/page/ReefInjectedSigner';
import Metadata from './Metadata';
import PostMessageProvider from './PostMessageProvider';
import Signer from './Signer';

export default class implements Injected {
  public readonly accounts: Accounts;

  public readonly metadata: Metadata;

  public readonly provider: PostMessageProvider;

  public readonly signer: Signer;

  public readonly reefSigner: ReefInjectedSigner;

  public readonly reefNetwork: ReefInjectedProvider;

  constructor (sendRequest: SendRequest) {
    this.accounts = new Accounts(sendRequest);
    this.metadata = new Metadata(sendRequest);
    this.provider = new PostMessageProvider(sendRequest);
    this.signer = new Signer(sendRequest);
    // REEF update
    this.reefNetwork = new ReefInjectedProvider(sendRequest);
    this.reefSigner = new ReefInjectedSigner(this.accounts, this.signer, this.reefNetwork);
  }
}
