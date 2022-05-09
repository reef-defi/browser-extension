// Copyright 2019-2021 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Runs in the extension background, handling all keyring access

import type { RequestSignatures, TransportRequestMessage } from '@reef-defi/extension-base/background/types'

import handlers from '@reef-defi/extension-base/background/handlers'
import { PORT_CONTENT, PORT_EXTENSION } from '@reef-defi/extension-base/defaults'
import { AccountsStore } from '@reef-defi/extension-base/stores'
import chrome from '@reef-defi/extension-inject/chrome'
import { assert } from '@reef-defi/util'
import { cryptoWaitReady } from '@reef-defi/util-crypto'

import keyring from '@polkadot/ui-keyring'

// setup the notification (same a FF default background, white text)
// eslint-disable-next-line no-void
void chrome.browserAction.setBadgeBackgroundColor({ color: '#d90000' })

// listen to all messages and handle appropriately
chrome.runtime.onConnect.addListener((port): void => {
  console.log('msg connect listener before handler=', port)
  // shouldn't happen, however... only listen to what we know about
  assert([PORT_CONTENT, PORT_EXTENSION].includes(port.name), `Unknown connection from ${port.name}`)

  // message and disconnect handlers
  port.onMessage.addListener((data: TransportRequestMessage<keyof RequestSignatures>) => {
    console.log('onMessage before handler =', data, ' port=', port)
    handlers(data, port)
  })
  port.onDisconnect.addListener(() => console.log(`Disconnected from ${port.name}`))
})

// initial setup
cryptoWaitReady()
  .then((): void => {
    console.log('crypto initialized')

    // load all the keyring data
    keyring.loadAll({ store: new AccountsStore(), type: 'sr25519' })
    console.log('KEYRING LOADED ALL=', keyring.getAccounts().length)
    console.log('initialization completed')
  })
  .catch((error): void => {
    console.error('initialization failed', error)
  })
