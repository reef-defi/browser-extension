// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '../../../../../__mocks__/chrome';

import type { SigningRequest } from '@reef-defi/extension-base/background/types';

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { configure, mount, ReactWrapper } from 'enzyme';
import { EventEmitter } from 'events';
import React, { useState } from 'react';
import { act } from 'react-dom/test-utils';
import { ThemeProvider } from 'styled-components';

import { ActionContext, Address, Input, SigningReqContext, themes } from '../../components';
import * as messaging from '../../messaging';
import * as MetadataCache from '../../MetadataCache';
import { flushAllPromises } from '../../testHelpers';
import Extrinsic from './Extrinsic';
import { westendMetadata } from './metadataMock';
import Qr from './Qr';
import Request from './Request';
import TransactionIndex from './TransactionIndex';
import Signing from '.';

// For this file, there are a lot of them
/* eslint-disable @typescript-eslint/no-unsafe-argument */

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
configure({ adapter: new Adapter() });

describe('Signing requests', () => {
  let wrapper: ReactWrapper;
  let onActionStub: jest.Mock;
  let signRequests: SigningRequest[] = [];

  const emitter = new EventEmitter();

  function MockRequestsProvider (): React.ReactElement {
    const [requests, setRequests] = useState(signRequests);

    emitter.on('request', setRequests);

    return (
      <SigningReqContext.Provider value={requests}>
        <Signing />
      </SigningReqContext.Provider>
    );
  }

  const mountComponent = async (): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    wrapper = mount(
      <ActionContext.Provider value={onActionStub}>
        <ThemeProvider theme={themes.dark}>
          <MockRequestsProvider />
        </ThemeProvider>
      </ActionContext.Provider>
    );
    await act(flushAllPromises);
    wrapper.update();
  };

  const check = (input: ReactWrapper): unknown => input.simulate('change', { target: { checked: true } });

  beforeEach(async () => {
    jest.spyOn(messaging, 'cancelSignRequest').mockResolvedValue(true);
    jest.spyOn(messaging, 'approveSignPassword').mockResolvedValue(true);
    jest.spyOn(messaging, 'isSignLocked').mockResolvedValue({ isLocked: true, remainingTime: 0 });
    jest.spyOn(MetadataCache, 'getSavedMeta').mockResolvedValue(westendMetadata);

    signRequests = [
      {
        account: {
          address: '5D4bqjQRPgdMBK8bNvhX4tSuCtSGZS7rZjD5XH5SoKcFeKn5',
          genesisHash: null,
          isHidden: false,
          name: 'acc1',
          parentAddress: '5Ggap6soAPaP5UeNaiJsgqQwdVhhNnm6ez7Ba1w9jJ62LM2Q',
          suri: '//0',
          whenCreated: 1602001346486
        },
        id: '1607347015530.2',
        request: {
          payload: {
            address: '5D4bqjQRPgdMBK8bNvhX4tSuCtSGZS7rZjD5XH5SoKcFeKn5',
            blockHash: '0x661f57d206d4fecda0408943427d4d25436518acbff543735e7569da9db6bdd7',
            blockNumber: '0x0033fa6b',
            era: '0xb502',
            genesisHash: '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
            method: '0x0403c6111b239376e5e8b983dc2d2459cbb6caed64cc1d21723973d061ae0861ef690b00b04e2bde6f',
            nonce: '0x00000003',
            signedExtensions: [
              'CheckSpecVersion',
              'CheckTxVersion',
              'CheckGenesis',
              'CheckMortality',
              'CheckNonce',
              'CheckWeight',
              'ChargeTransactionPayment'
            ],
            specVersion: '0x0000002d',
            tip: '0x00000000000000000000000000000000',
            transactionVersion: '0x00000003',
            version: 4
          },
          sign: jest.fn()
        },
        url: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fwestend-rpc.polkadot.io#/accounts'
      },
      {
        account: {
          address: '5Ggap6soAPaP5UeNaiJsgqQwdVhhNnm6ez7Ba1w9jJ62LM2Q',
          genesisHash: null,
          isHidden: false,
          name: 'acc 2',
          suri: '//0',
          whenCreated: 1602001346486
        },
        id: '1607356155395.3',
        request: {
          payload: {
            address: '5Ggap6soAPaP5UeNaiJsgqQwdVhhNnm6ez7Ba1w9jJ62LM2Q',
            blockHash: '0xcf69b7935b785f90b22d2b36f2227132ef9c5dd33db1dbac9ecdafac05bf9476',
            blockNumber: '0x0036269a',
            era: '0xa501',
            genesisHash: '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
            method: '0x0400cc4e0e2848c488896dd0a24f153070e85e3c83f6199cfc942ab6de29c56c2d7b0700d0ed902e',
            nonce: '0x00000003',
            signedExtensions: [
              'CheckSpecVersion',
              'CheckTxVersion',
              'CheckGenesis',
              'CheckMortality',
              'CheckNonce',
              'CheckWeight',
              'ChargeTransactionPayment'
            ],
            specVersion: '0x0000002d',
            tip: '0x00000000000000000000000000000000',
            transactionVersion: '0x00000003',
            version: 4
          },
          sign: jest.fn()
        },
        url: 'https://polkadot.js.org/apps'
      }
    ];
    onActionStub = jest.fn();
    await mountComponent();
  });

  describe('Switching between requests', () => {
    it('initially first request should be shown', () => {
      expect(wrapper.find(TransactionIndex).text()).toBe('1/2');
      expect(wrapper.find(Request).prop('signId')).toBe(signRequests[0].id);
    });

    it('only the right arrow should be active on first screen', async () => {
      expect(wrapper.find('FontAwesomeIcon.arrowLeft')).toHaveLength(1);
      expect(wrapper.find('FontAwesomeIcon.arrowLeft.active')).toHaveLength(0);
      expect(wrapper.find('FontAwesomeIcon.arrowRight.active')).toHaveLength(1);
      wrapper.find('FontAwesomeIcon.arrowLeft').simulate('click');
      await act(flushAllPromises);

      expect(wrapper.find(TransactionIndex).text()).toBe('1/2');
    });

    it('should display second request after clicking right arrow', async () => {
      wrapper.find('FontAwesomeIcon.arrowRight').simulate('click');
      await act(flushAllPromises);

      expect(wrapper.find(TransactionIndex).text()).toBe('2/2');
      expect(wrapper.find(Request).prop('signId')).toBe(signRequests[1].id);
    });

    it('only the left should be active on second screen', async () => {
      wrapper.find('FontAwesomeIcon.arrowRight').simulate('click');
      await act(flushAllPromises);

      expect(wrapper.find('FontAwesomeIcon.arrowLeft.active')).toHaveLength(1);
      expect(wrapper.find('FontAwesomeIcon.arrowRight')).toHaveLength(1);
      expect(wrapper.find('FontAwesomeIcon.arrowRight.active')).toHaveLength(0);
      expect(wrapper.find(TransactionIndex).text()).toBe('2/2');
    });

    it('should display previous request after the left arrow has been clicked', async () => {
      wrapper.find('FontAwesomeIcon.arrowRight').simulate('click');
      await act(flushAllPromises);
      wrapper.find('FontAwesomeIcon.arrowLeft').simulate('click');
      await act(flushAllPromises);

      expect(wrapper.find(TransactionIndex).text()).toBe('1/2');
      expect(wrapper.find(Request).prop('signId')).toBe(signRequests[0].id);
    });
  });

  describe('External account', () => {
    it('shows Qr scanner for external accounts', async () => {
      signRequests = [{
        account: {
          address: '5Cf1CGZas62RWwce3d2EPqUvSoi1txaXKd9M5w9bEFSsQtRe',
          genesisHash: null,
          isExternal: true,
          isHidden: false,
          name: 'Dave account on Signer ',
          whenCreated: 1602085704296
        },
        id: '1607357806151.5',
        request: {
          payload: {
            address: '5Cf1CGZas62RWwce3d2EPqUvSoi1txaXKd9M5w9bEFSsQtRe',
            blockHash: '0xd2f2dfb56c16af1d0faf5b454153d3199aeb6647537f4161c26a34541c591ec8',
            blockNumber: '0x00340171',
            era: '0x1503',
            genesisHash: '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
            method: '0x0403c6111b239376e5e8b983dc2d2459cbb6caed64cc1d21723973d061ae0861ef690b00b04e2bde6f',
            nonce: '0x00000000',
            signedExtensions: [
              'CheckSpecVersion',
              'CheckTxVersion',
              'CheckGenesis',
              'CheckMortality',
              'CheckNonce',
              'CheckWeight',
              'ChargeTransactionPayment'
            ],
            specVersion: '0x0000002d',
            tip: '0x00000000000000000000000000000000',
            transactionVersion: '0x00000003',
            version: 4
          },
          sign: jest.fn()
        },
        url: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fwestend-rpc.polkadot.io#/accounts'
      }];
      await mountComponent();
      expect(wrapper.find(Extrinsic)).toHaveLength(0);
      expect(wrapper.find(Qr)).toHaveLength(1);
    });
  });

  describe('Request rendering', () => {
    it('correctly displays request 1', () => {
      expect(wrapper.find(Address).find('.account-card__address').prop('title')).toBe(signRequests[0].account.address);
      const compareStringArr = [
        'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fwestend-rpc.polkadot.io#/accounts',
        'Westend',
        '45',
        '3',
        `balances.transferKeepAlive(dest, value){
  "dest": "5GYQRJj3NUznYDzCduENRcocMsyxmb6tjb5xW87ZMErBe9R7",
  "value": "123.0000 WND"
}`,
        'Same as the [`transfer`] call, but with a check that the transfer will not kill the origin account.',
        'mortal, valid from {{birth}} to {{death}}'
      ];
      const outputStringArr = wrapper.find(Extrinsic).find('td.data').map((el): string => el.text());

      compareStringArr.forEach((val, index) => {
        expect(outputStringArr[index]).toEqual(compareStringArr[index]);
      });
    });

    it('correctly displays request 2', async () => {
      wrapper.find('FontAwesomeIcon.arrowRight').simulate('click');
      await act(flushAllPromises);
      expect(wrapper.find(Address).find('.account-card__address').prop('title')).toBe(signRequests[1].account.address);
      const compareStringArr = [
        'https://polkadot.js.org/apps',
        'Westend',
        '45',
        '3',
        'balances.transfer(dest, value){\n' +
        '  "dest": "5Ggap6soAPaP5UeNaiJsgqQwdVhhNnm6ez7Ba1w9jJ62LM2Q",\n' +
        '  "value": "200.0000 mWND"\n' +
        '}',
        'Transfer some liquid free balance to another account.',
        'mortal, valid from {{birth}} to {{death}}'
      ];
      const outputStringArr = wrapper.find(Extrinsic).find('td.data').map((el): string => el.text());

      compareStringArr.forEach((val, index) => {
        expect(outputStringArr[index]).toEqual(compareStringArr[index]);
      });
    });
  });

  describe('Submitting', () => {
    it('passes request id to cancel call', async () => {
      wrapper.find('.cancelButton').find('a').simulate('click');
      await act(flushAllPromises);

      expect(messaging.cancelSignRequest).toBeCalledWith(signRequests[0].id);
    });

    it('passes request id and password to approve call', async () => {
      wrapper.find(Input).simulate('change', { target: { value: 'hunter1' } });
      await act(flushAllPromises);
      wrapper.find('.uik-cta__text').simulate('click');
      await act(flushAllPromises);
      wrapper.update();

      expect(messaging.approveSignPassword).toBeCalledWith(signRequests[0].id, false, 'hunter1');
    });

    it('asks the background to cache the password when the relevant checkbox is checked', async () => {
      check(wrapper.find('input[type="checkbox"]'));
      await act(flushAllPromises);

      wrapper.find(Input).simulate('change', { target: { value: 'hunter1' } });
      await act(flushAllPromises);

      wrapper.find('.uik-cta__text').simulate('click');
      await act(flushAllPromises);
      wrapper.update();

      expect(messaging.approveSignPassword).toBeCalledWith(signRequests[0].id, true, 'hunter1');
    });

    it('shows an error when the password is wrong', async () => {
      // silencing the following expected console.error
      console.error = jest.fn();
      // eslint-disable-next-line @typescript-eslint/require-await
      jest.spyOn(messaging, 'approveSignPassword').mockImplementation(async () => {
        throw new Error('Unable to decode using the supplied passphrase');
      });

      wrapper.find(Input).simulate('change', { target: { value: 'anything' } });
      await act(flushAllPromises);

      wrapper.find('.uik-cta__text').simulate('click');
      await act(flushAllPromises);
      wrapper.update();

      expect(wrapper.find('.warning-message').first().text()).toBe('Unable to decode using the supplied passphrase');
    });

    it('when last request has been removed/cancelled, shows the previous one', async () => {
      wrapper.find('FontAwesomeIcon.arrowRight').simulate('click');
      await act(flushAllPromises);

      act(() => {
        emitter.emit('request', [signRequests[0]]);
      });
      await act(flushAllPromises);
      wrapper.update();

      expect(wrapper.find(TransactionIndex)).toHaveLength(0);
      expect(wrapper.find(Request).prop('signId')).toBe(signRequests[0].id);
    });
  });
});
