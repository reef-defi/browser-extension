// Copyright 2019-2021 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { InjectedAccount, InjectedAccounts, Unsubcall } from '@reef-defi/extension-inject/types';
import type { SendRequest } from './types';

// External to class, this.# is not private enough (yet)
let sendRequest: SendRequest;

export default class Accounts implements InjectedAccounts {
  constructor (_sendRequest: SendRequest) {
    sendRequest = _sendRequest;
  }

  public get (anyType?: boolean): Promise<InjectedAccount[]> {
    return sendRequest('pub(accounts.list)', { anyType });
  }

  public subscribe (cb: (accounts: InjectedAccount[]) => unknown): Unsubcall {
    sendRequest('pub(accounts.subscribe)', null, cb)
      .catch((error: Error) => console.error(error));

    return (): void => {
      // FIXME we need the ability to unsubscribe
    };
  }
}
