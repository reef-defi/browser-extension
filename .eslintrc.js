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
  },
  rules: {
    ...base.rules,
    // this seems very broken atm, false positives
    "@typescript-eslint/unbound-method": "off",
    "@typescript-eslint/no-explicit-any": "off",

    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/restrict-plus-operands": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "no-void": "off",
    "@typescript-eslint/no-misused-promises": [
      "error",
      { checksVoidReturn: false },
    ],
    "react/jsx-no-bind": "off",
    "react/jsx-closing-bracket-location": "off",
  },
};
