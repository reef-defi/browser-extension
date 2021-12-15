// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KnownSubstrate, KnownGenesis, KnownLedger, Network } from '@polkadot/networks/types';

const knownGenesis: KnownGenesis = {
  "reef-testnet": [
    '0x0f89efd7bf650f2d521afef7456ed98dff138f54b5b7915cc9bce437ab728660'
  ],
  "reef-mainnet": [
    '0x7834781d38e4798d548e34ec947d19deea29df148a7bf32484b7b24dacf8d4b7'
  ]
}
export const knownLedger: KnownLedger = {
  "reef-testnet": 0x00000333,
  "reef-mainnet": 0x00000333,
}

function toExpanded (o: KnownSubstrate): Network {
  const network = o.network || '';
  const n = o as Network;

  // ledger additions
  n.slip44 = knownLedger[network];
  n.hasLedgerSupport = !!n.slip44;

  // general items
  n.genesisHash = knownGenesis[network] || [];
  //n.icon = knownIcon[network] || 'substrate';
  n.icon = 'substrate';

  // filtering
  n.isTestnet = false;
  n.isIgnored = false;

  return n;
}

export const selectableNetworks: KnownSubstrate[] = [
  {
    decimals: [18],
    displayName: 'Reef Testnet',
    network: 'reef-testnet',
    prefix: 42,
    standardAccount: '*25519',
    symbols: ['REEF'],
    website: 'https://reef.io/'
  },
  {
    decimals: [18],
    displayName: 'Reef Mainnet',
    network: 'reef-mainnet',
    prefix: 42,
    standardAccount: '*25519',
    symbols: ['REEF'],
    website: 'https://reef.io/'
  }
]

export default selectableNetworks.map(toExpanded).filter((network) => network.hasLedgerSupport);
