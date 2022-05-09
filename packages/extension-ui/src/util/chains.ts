// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MetadataDefBase } from '@reef-defi/extension-inject/types'

import { selectableNetworks } from '@reef-defi/networks'

const hashes: MetadataDefBase[] = [] /* selectableNetworks
  .filter(({ genesisHash, displayName }) => {
    return !!genesisHash.length
  })
  .map((network) => ({
    chain: network.displayName,
    genesisHash: network.genesisHash[0],
    icon: network.icon,
    ss58Format: network.prefix
  })); */

export default hashes
