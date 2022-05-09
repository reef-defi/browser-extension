// Copyright 2019-2021 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

const base = require("@reef-defi/dev/config/eslint.cjs");

module.exports = {
  ...base,
  ignorePatterns: [
    ".eslintrc.js",
    ".github/**",
    ".vscode/**",
    ".yarn/**",
    "**/build/*",
    "**/coverage/*",
    "**/node_modules/*",
  ],
  parserOptions: {
    ...base.parserOptions,
    project: ["./tsconfig.json"],
    "sourceType": "module"
  },
  rules: {
    // ...base.rules,
    // this seems very broken atm, false positives
    "@typescript-eslint/unbound-method": "off",
    "@typescript-eslint/no-unsafe-assignment":"off",
    "@typescript-eslint/no-unsafe-member-access":"off",
    "@typescript-eslint/no-explicit-any":"off",
    "@typescript-eslint/ban-ts-comment":"off",
    "@typescript-eslint/no-misused-promises":"off",
    "@typescript-eslint/no-floating-promises":"off",
    "@typescript-eslint/no-empty-function":"off",
    "@typescript-eslint/no-unsafe-call":"off",
    "@typescript-eslint/no-unsafe-return":"off",
    "@typescript-eslint/restrict-template-expressions":"off",
  },
};
