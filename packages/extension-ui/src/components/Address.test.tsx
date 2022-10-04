// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '../../../../__mocks__/chrome';

import type { AccountJson } from '@reef-defi/extension-base/background/types';
import type { ReactWrapper } from 'enzyme';
import type { Signer as InjectedSigner } from '@polkadot/api/types';
import type { IconTheme } from '@polkadot/react-identicon/types';
import type { Props as AddressComponentProps } from './Address';

import { ReefSigner } from '@reef-defi/react-lib';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { configure, mount } from 'enzyme';
import { BigNumber } from 'ethers';
import React from 'react';
import { act } from 'react-dom/test-utils';

import * as messaging from '../messaging';
import * as MetadataCache from '../MetadataCache';
import { westendMetadata } from '../Popup/Signing/metadataMock';
import { flushAllPromises } from '../testHelpers';
import { buildHierarchy } from '../util/buildHierarchy';
import { DEFAULT_TYPE } from '../util/defaultType';
import getParentNameSuri from '../util/getParentNameSuri';
import { AccountContext, Address } from '.';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
configure({ adapter: new Adapter() });

interface AccountTestJson extends AccountJson {
  expectedIconTheme: IconTheme
}

interface AccountTestGenesisJson extends AccountTestJson {
  expectedEncodedAddress: string;
  expectedNetworkLabel: string;
  genesisHash: string;
}

const externalAccount = { address: '5EeaoDj4VDk8V6yQngKBaCD5MpJUCHrhYjVhBjgMHXoYon1s', expectedIconTheme: 'polkadot', isExternal: true, name: 'External Account', type: 'sr25519' } as AccountJson;
const hardwareAccount = {
  address: '5GhcSaumJi2XBqADYk4h3c1mHSbkuqYDTAG9v2zL8TmqoGXy',
  expectedIconTheme: 'polkadot',
  // Kusama genesis hash
  genesisHash: '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
  isExternal: true,
  isHardware: true,
  name: 'Hardware Account',
  type: 'sr25519'
} as AccountJson;

const accounts = [
  { address: '5HSDXAC3qEMkSzZK377sTD1zJhjaPiX5tNWppHx2RQMYkjaJ', expectedIconTheme: 'polkadot', name: 'ECDSA Account', type: 'ecdsa' },
  // { address: '5HSDXAC3qEMkSzZK377sTD1zJhjaPiX5tNWppHx2RQMYkjaJ', expectedIconTheme: 'polkadot', name: 'ECDSA Account', type: 'ecdsa' },
  { address: '5FjgD3Ns2UpnHJPVeRViMhCttuemaRXEqaD8V5z4vxcsUByA', expectedIconTheme: 'polkadot', name: 'Ed Account', type: 'ed25519' },
  { address: '5Ggap6soAPaP5UeNaiJsgqQwdVhhNnm6ez7Ba1w9jJ62LM2Q', expectedIconTheme: 'polkadot', name: 'Parent Sr Account', type: 'sr25519' },
  { address: '0xd5D81CD4236a43F48A983fc5B895975c511f634D', expectedIconTheme: 'ethereum', name: 'Ethereum', type: 'ethereum' },
  { ...externalAccount },
  { ...hardwareAccount }
] as AccountTestJson[];

// With Westend genesis Hash
// This account isn't part of the generic test because Westend isn't a built in network
// The network would only be displayed if the corresponding metadata are known
const westEndAccount = {
  address: 'Cs2LLqQ6DSRx8UPdVp6jny4DvwNqziBSowSu5Nb1u3R6Z7X',
  expectedEncodedAddress: '5CMQg2VXTrRWCUewro13qqc45Lf93KtzzS6hWR6dY6pvMZNF',
  expectedIconTheme: 'polkadot',
  expectedNetworkLabel: 'Westend',
  genesisHash: '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
  name: 'acc',
  type: 'ed25519'
} as AccountTestGenesisJson;

const accountsWithGenesisHash = [
  {
    address: '5GYQRJj3NUznYDzCduENRcocMsyxmb6tjb5xW87ZMErBe9R7',
    expectedEncodedAddress: '5GYQRJj3NUznYDzCduENRcocMsyxmb6tjb5xW87ZMErBe9R7',
    expectedIconTheme: 'substrate',
    expectedNetworkLabel: 'Reef Mainnet',
    genesisHash: '0x7834781d38e4798d548e34ec947d19deea29df148a7bf32484b7b24dacf8d4b7',
    type: 'sr25519'
  }
] as AccountTestGenesisJson[];

const mountComponent = async (addressComponentProps: AddressComponentProps, contextAccounts: AccountJson[]): Promise<{
  wrapper: ReactWrapper;
}> => {
  const actionStub = jest.fn();
  const { actions = actionStub } = addressComponentProps;

  const wrapper = mount(
    <AccountContext.Provider
      value={{
        accounts: contextAccounts,
        hierarchy: buildHierarchy(contextAccounts)
      }}
    >
      <Address
        // @ts-ignore
        actions={actions}
        {...addressComponentProps}
      />
    </AccountContext.Provider>
  );

  await act(flushAllPromises);
  wrapper.update();

  return { wrapper };
};

const signerPropVal = {
  signerProp: {
    address: '5fda333',
    balance: BigNumber.from('3423'),
    evmAddress: '0x234fdas',
    isEvmClaimed: false,
    name: 'signnn',
    signer: ({} as any),
    source: 'extension',
    sign: ({} as InjectedSigner)
  } as ReefSigner
};

const getWrapper = async (account: AccountJson, contextAccounts: AccountJson[], withAccountsInContext: boolean) => {
  // the address component can query info about the account from the account context
  // in this case, the account's address (any encoding) should suffice
  // In case the account is not in the context, then more info are needed as props
  // to display accurately
  const mountedComponent = withAccountsInContext
  // only the address is passed as props, the full acount info are loaded in the context
    ? await mountComponent({ address: account.address, ...signerPropVal }, contextAccounts)
  // the context is empty, all account's info are passed as props to the Address component
    : await mountComponent({ ...account, signerProp: (signerPropVal.signerProp) } as AddressComponentProps, []);

  return mountedComponent.wrapper;
};

const genericTestSuite = (account: AccountTestJson, withAccountsInContext = true) => {
  let wrapper: ReactWrapper;
  const { address, expectedIconTheme, name = '', type = DEFAULT_TYPE } = account;

  describe(`Account ${withAccountsInContext ? 'in context from address' : 'from props'} (${name}) - ${type}`, () => {
    beforeAll(async () => {
      wrapper = await getWrapper(account, accounts, withAccountsInContext);
    });

    it('shows the account address and name', () => {
      expect(wrapper.find('.account-card__address').first().prop('title')).toEqual(address);
      expect(wrapper.find('.account-card__name--main').text()).toEqual(name);
    });

    it(`shows a ${expectedIconTheme} identicon`, () => {
      expect(wrapper.find('.account-card__identicon--loading').first()).toBeTruthy();
    });

    it('can copy its address', () => {
      expect(wrapper.find('.account-card__meta title').first().text()).toEqual('Copy Reef Account Address');
    });

    it('has the account visiblity icon', () => {
      expect(wrapper.find('.svg-inline--fa.account-card__visibility').length).toEqual(1);
    });

    it('can hide the account', () => {
      jest.spyOn(messaging, 'showAccount').mockResolvedValue(false);

      const visibleIcon = wrapper.find('.account-card__visibility--visible');
      const hiddenIcon = wrapper.find('.account-card__visibility--hidden');

      expect(visibleIcon.exists()).toBe(true);
      expect(hiddenIcon.exists()).toBe(false);

      visibleIcon.first().simulate('click');
      expect(messaging.showAccount).toBeCalledWith(address, false);
    });

    it('can show the account if hidden', async () => {
      const additionalProps = { isHidden: true };

      const mountedHiddenComponent = withAccountsInContext
        ? await mountComponent({ address, ...additionalProps, ...signerPropVal }, accounts)
        : await mountComponent({ ...account, ...additionalProps, ...signerPropVal } as AddressComponentProps, []);

      const wrapperHidden = mountedHiddenComponent.wrapper;

      jest.spyOn(messaging, 'showAccount').mockResolvedValue(true);

      const visibleIcon = wrapperHidden.find('.account-card__visibility--visible');
      const hiddenIcon = wrapperHidden.find('.account-card__visibility--hidden');

      expect(visibleIcon.exists()).toBe(false);
      expect(hiddenIcon.exists()).toBe(true);

      hiddenIcon.first().simulate('click');
      expect(messaging.showAccount).toBeCalledWith(address, true);
    });

    it('has settings button', () => {
      expect(wrapper.find('.account-card__actions').length).toEqual(1);
    });
  });
};

const genesisHashTestSuite = (account: AccountTestGenesisJson, withAccountsInContext = true) => {
  const { expectedEncodedAddress, expectedNetworkLabel } = account;

  describe(`Account ${withAccountsInContext ? 'in context from address' : 'from props'} with ${expectedNetworkLabel} genesiHash`, () => {
    let wrapper: ReactWrapper;

    beforeAll(async () => {
      wrapper = await getWrapper(account, accountsWithGenesisHash, withAccountsInContext);
    });

    it('shows the account address correctly encoded', () => {
      expect(wrapper.find('.account-card__address').first().prop('title')).toEqual(expectedEncodedAddress);
    });

    it('Copy buttons contain the encoded address', () => {
      // the first CopyToClipboard is from the identicon, the second from the copy button
      expect(wrapper.find('.account-card__address').first().prop('title')).toEqual(expectedEncodedAddress);
    });
  });
};

describe('Address', () => {
  accounts.forEach((account) => {
    genericTestSuite(account);
    genericTestSuite(account, false);
  });

  accountsWithGenesisHash.forEach((account) => {
    genesisHashTestSuite(account);
    genesisHashTestSuite(account, false);
  });

  describe('External account', () => {
    let wrapper: ReactWrapper;

    beforeAll(async () => {
      wrapper = await getWrapper(externalAccount, [], false);
    });

    it('has an icon in front of its name', () => {
      expect(wrapper.find('.account-card__name').find('FontAwesomeIcon [data-icon="qrcode"]').exists()).toBe(true);
    });
  });

  describe('Hardware wallet account', () => {
    let wrapper: ReactWrapper;

    beforeAll(async () => {
      wrapper = await getWrapper(hardwareAccount, [], false);
    });

    it('has a usb icon in front of its name', () => {
      expect(wrapper.find('.account-card__name').find('FontAwesomeIcon [data-icon="usb"]').exists()).toBe(true);
    });
  });

  describe('Encoding and label based on Metadata', () => {
    let wrapper: ReactWrapper;

    beforeAll(async () => {
      jest.spyOn(MetadataCache, 'getSavedMeta').mockResolvedValue(westendMetadata);

      wrapper = await getWrapper(westEndAccount, [], false);
    });

    it('shows the account correctly reencoded', () => {
      expect(wrapper.find('.account-card__address').first().prop('title')).toEqual(westEndAccount.expectedEncodedAddress);
    });
  });

  describe('Derived accounts', () => {
    let wrapper: ReactWrapper;
    const childAccount = {
      address: '5Ggap6soAPaP5UeNaiJsgqQwdVhhNnm6ez7Ba1w9jJ62LM2Q',
      name: 'Luke',
      parentName: 'Dark Vador',
      suri: '//42',
      type: 'sr25519'
    } as AccountJson;

    beforeAll(async () => {
      wrapper = await getWrapper(childAccount, [], false);
    });

    it('shows the child\'s account address and name', () => {
      expect(wrapper.find('.account-card__address').first().prop('title')).toEqual(childAccount.address);
      expect(wrapper.find('.account-card__name--main').text()).toEqual(childAccount.name);
    });

    it('shows the parent account and suri', () => {
      const expectedParentNameSuri = getParentNameSuri(childAccount.parentName as string, childAccount.suri);

      expect(wrapper.find('.account-card__parent-name').text()).toEqual(expectedParentNameSuri);
    });
  });
});
