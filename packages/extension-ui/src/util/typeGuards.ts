// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeyringPair$Json } from '@reef-defi/keyring/types';
import type { KeyringPairs$Json } from '@polkadot/ui-keyring/types';

export function isKeyringPairs$Json (json: KeyringPair$Json | KeyringPairs$Json): json is KeyringPairs$Json {
  return (json.encoding.content).includes('batch-pkcs8');
}
