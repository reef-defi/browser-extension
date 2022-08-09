// Copyright 2019-2021 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RequestSignatures, TransportRequestMessage } from '@reef-defi/extension-base/background/types';
import type { Message } from '@reef-defi/extension-base/types';

import { PORT_CONTENT } from '@reef-defi/extension-base/defaults';
import { enable, handleResponse, redirectIfPhishing } from '@reef-defi/extension-base/page';
import { injectExtension } from '@reef-defi/extension-inject';

(window as any)._reefInjectionInit = true;

// setup a response listener (events created by the loader for extension responses)
window.addEventListener('message', ({ data, source }: Message): void => {
  // only allow messages from our window, by the loader
  if (source !== window || data.origin !== PORT_CONTENT) {
    return;
  }

  if (data.id) {
    handleResponse(data as TransportRequestMessage<keyof RequestSignatures>);
  } else {
    console.error('Missing id for response.');
  }
});

redirectIfPhishing().then((gotRedirected) => {
  if (!gotRedirected) {
    inject();
  }
}).catch((e) => {
  console.warn(`Unable to determine if the site is in the phishing list: ${(e as Error).message}`);
  inject();
});

function inject () {
  injectExtension(enable, {
    name: 'reef',
    version: process.env.PKG_VERSION as string
  });
  console.log('inject called');
  const event = new Event('reef-injected');

  document.dispatchEvent(event);
}
