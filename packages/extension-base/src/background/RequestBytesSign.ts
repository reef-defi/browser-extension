// Copyright 2019-2021 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeyringPair } from '@reef-defi/keyring/types';
import type { HexString } from '@reef-defi/util/types';
import type { SignerPayloadRaw } from '@polkadot/types/types';
import type { RequestSign } from './types';

import { wrapBytes } from '@reef-defi/extension-dapp/wrapBytes';
import { u8aToHex } from '@reef-defi/util';

import { TypeRegistry } from '@polkadot/types';

export default class RequestBytesSign implements RequestSign {
  public readonly payload: SignerPayloadRaw;

  constructor (payload: SignerPayloadRaw) {
    this.payload = payload;
  }

  sign (_registry: TypeRegistry, pair: KeyringPair): { signature: HexString } {
    return {
      signature: u8aToHex(
        pair.sign(
          wrapBytes(this.payload.data)
        )
      )
    };
  }
}
