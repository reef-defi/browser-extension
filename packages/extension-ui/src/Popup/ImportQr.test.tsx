// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '../../../../__mocks__/chrome';

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { configure, mount, ReactWrapper } from 'enzyme';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router';

import { Button } from '../components';
import * as messaging from '../messaging';
import { flushAllPromises } from '../testHelpers';
import ImportQr from './ImportQr';

const mockedAccount = {
  content: '5DffWm9EaJRss9w5LiAj7f3s2D9PYd8GsVAuLwPVbMxnVjbA',
  expectedBannerChain: 'Polkadot',
  genesisHash: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
  isAddress: true,
  name: 'My Polkadot Account'
};

interface ScanType {
  isAddress: boolean;
  content: string;
  genesisHash: string;
  name?: string;
}

interface QrScanAddressProps {
  className?: string;
  onError?: (error: Error) => void;
  onScan: (scanned: ScanType) => void;
  size?: string | number;
  style?: React.CSSProperties;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
configure({ adapter: new Adapter() });

const typeName = async (wrapper: ReactWrapper, value: string) => {
  wrapper.find('input').first().simulate('change', { target: { value } });
  await act(flushAllPromises);
  wrapper.update();
};

jest.mock('@polkadot/react-qr', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    QrScanAddress: ({ onScan }: QrScanAddressProps): null => {
      return null;
    }
  };
});

describe('ImportQr component', () => {
  let wrapper: ReactWrapper;

  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    wrapper = mount(
      <MemoryRouter>
        <ImportQr />
      </MemoryRouter>
    );

    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      (wrapper.find('QrScanAddress').first().prop('onScan') as unknown as QrScanAddressProps['onScan'])(mockedAccount);
    });
    await act(flushAllPromises);
    wrapper.update();
  });

  describe('Address component', () => {
    it('shows account as external', () => {
      expect(wrapper.find('.account-card__name .externalIcon').exists()).toBe(true);
    });

    it('shows the correct name', () => {
      expect(wrapper.find('.account-card__name span').text()).toEqual(mockedAccount.name);
    });

    it('shows the correct address', () => {
      expect(wrapper.find('.account-card__address').text().endsWith(mockedAccount.content.substring(mockedAccount.content.length - 4))).toEqual(true);
    });
  });

  it('has the button enabled', () => {
    expect(wrapper.find('.next-step-btn').first().getElement().props.disabled).toBe(false);
  });

  it('displays and error and the button is disabled with a short name', async () => {
    await typeName(wrapper, 'a');

    expect(wrapper.find('.warning-message').first().text()).toBe('Account name is too short');
    expect(wrapper.find('.next-step-btn').first().getElement().props.disabled).toBe(true);
  });

  it('has no error message and button enabled with a long name', async () => {
    const longName = 'aaa';

    await typeName(wrapper, 'a');
    await typeName(wrapper, longName);
    expect(wrapper.find('.warning-message')).toHaveLength(0);
    expect(wrapper.find('.next-step-btn').first().getElement().props.disabled).toBe(false);
    expect(wrapper.find('.account-card__name span').first().text()).toEqual(longName);
  });

  it('shows the external name in the input field', () => {
    expect(wrapper.find('input').prop('value')).toBe(mockedAccount.name);
  });

  it('creates the external account', async () => {
    jest.spyOn(messaging, 'createAccountExternal').mockResolvedValue(false);
    wrapper.find('.next-step-btn').first().simulate('click');
    await act(flushAllPromises);

    expect(messaging.createAccountExternal).toHaveBeenCalledWith(mockedAccount.name, mockedAccount.content, mockedAccount.genesisHash);
  });
});
