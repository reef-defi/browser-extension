// Copyright 2019-2021 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

const createConfig = require('./webpack.shared.cjs');
const path = require('path');

module.exports = createConfig(
  {
    extension: './src/extension.ts'
  },
  {
    '@polkadot/wasm-crypto-wasm/data.js': require.resolve('@polkadot/wasm-crypto-wasm/empty')
  },
  {
    splitChunks: {
      chunks: 'all',
      maxSize: 4000000,
      minSize: 1000000
    }
  },
  {
    chunkFilename: '[name].js',
    filename: (pathData) => {
      return `/extension-js/${pathData.chunk.id}.js`;
    },
    globalObject: '(typeof self !== \'undefined\' ? self : this)',
    path: path.join(__dirname, 'build')
  }
);
