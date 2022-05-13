// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson, AccountWithChildren } from '@reef-defi/extension-base/background/types';

import { buildHierarchy } from './buildHierarchy';

const testHierarchy = (accounts: AccountJson[], expected: AccountWithChildren[]): void => {
  expect(buildHierarchy(accounts)).toEqual(expected);
};

describe('Use Account Hierarchy', () => {
  const acc = (address: string, parentAddress?: string, whenCreated?: number, name?: string, suri?: string): {
    address: string;
    name?: string;
    parentAddress?: string;
    suri?: string;
    whenCreated?: number;
  } => ({
    address,
    name,
    parentAddress,
    suri,
    whenCreated
  });

  test('for empty account list, returns empty list', () => {
    testHierarchy([], []);
  });

  test('returns one account', () => {
    testHierarchy([acc('a')], [acc('a')]);
  });

  test('puts child account into children field of parent: single child', () => {
    testHierarchy([acc('a'), acc('b', 'a')], [
      { address: 'a', children: [acc('b', 'a')] }
    ]);
  });

  test('puts child account into children field of parent: more children', () => {
    testHierarchy([acc('a'), acc('b', 'a'), acc('c', 'a')], [
      { address: 'a', children: [acc('b', 'a'), acc('c', 'a')] }
    ]);
  });

  test('puts child account into children field of parent: 2 roots', () => {
    testHierarchy([acc('a'), acc('b', 'a'), acc('c', 'a'), acc('d')], [
      { address: 'a', children: [acc('b', 'a'), acc('c', 'a')] },
      acc('d')
    ]);
  });

  test('handles grandchildren', () => {
    testHierarchy([acc('a'), acc('b', 'a'), acc('c', 'b')], [{
      address: 'a',
      children: [{
        ...acc('b', 'a'),
        children: [acc('c', 'b')]
      }]
    }]);
  });

  test('sorts accounts by name and creation date', () => {
    testHierarchy(
      [acc('b', undefined, 2, 'b'), acc('z', undefined, 1, 'b'), acc('a', undefined, 4, 'a')],
      [{ address: 'a', name: 'a', whenCreated: 4 }, { address: 'z', name: 'b', whenCreated: 1 }, { address: 'b', name: 'b', whenCreated: 2 }]
    );
  });

  test('sorts account children by name and path', () => {
    testHierarchy(
      [acc('a', undefined, 1, 'a'), acc('b', 'a', 1, 'b', '/2'), acc('b', 'a', 1, 'b', '/0')],
      [{ address: 'a', children: [acc('b', 'a', 1, 'b', '/0'), acc('b', 'a', 1, 'b', '/2')], name: 'a', whenCreated: 1 }]
    );
  });

  test('sorts accounts with children by name and creation date', () => {
    testHierarchy(
      [acc('b', undefined, 2, 'b'), acc('z', undefined, 1, 'b'), acc('d', 'b', 2, 'd'), acc('c', 'b', 3, 'c'), acc('a', undefined, 4, 'a')],
      [{ address: 'a', name: 'a', whenCreated: 4 }, { address: 'z', name: 'b', whenCreated: 1 }, { address: 'b', children: [acc('c', 'b', 3, 'c'), acc('d', 'b', 2, 'd')], name: 'b', whenCreated: 2 }]
    );
  });

  test('if creation time is missing, puts account at the back of a list', () => {
    testHierarchy(
      [acc('a'), acc('b', undefined, 2), acc('c', undefined, 1)],
      [acc('c', undefined, 1), acc('b', undefined, 2), acc('a')]
    );
  });
});
