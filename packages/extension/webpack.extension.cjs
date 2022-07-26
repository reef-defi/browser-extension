// Copyright 2019-2021 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

const createConfig = require('./webpack.shared.cjs');
const chunkingConfigData = require('./webpack.chunking.cjs');

module.exports = createConfig(
  {
    extension: './src/extension.ts'
  },
  ...chunkingConfigData
);
