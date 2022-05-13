// Copyright 2019-2021 @polkadot/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

const ALLOWED_PATH = ['/', '/account/import-ledger', '/account/restore-json'] as const;
const PORT_CONTENT = 'reef_content';
const PHISHING_PAGE_REDIRECT = '/phishing-page-detected';
const PORT_EXTENSION = 'reef_extension';
const PORT_PAGE = 'reef_page';
const PASSWORD_EXPIRY_MIN = 15;
const PASSWORD_EXPIRY_MS = PASSWORD_EXPIRY_MIN * 60 * 1000;

export {
  ALLOWED_PATH,
  PASSWORD_EXPIRY_MIN,
  PASSWORD_EXPIRY_MS,
  PHISHING_PAGE_REDIRECT,
  PORT_CONTENT,
  PORT_EXTENSION,
  PORT_PAGE
};
