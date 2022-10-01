// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '../../../../../__mocks__/chrome';

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { configure, mount, ReactWrapper } from 'enzyme';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { ThemeProvider } from 'styled-components';

import { ActionContext, themes } from '../../components';
import * as messaging from '../../messaging';
import { Header } from '../../partials';
import { flushAllPromises } from '../../testHelpers';
import CreateAccount from '.';

// For this file, there are a lot of them
/* eslint-disable @typescript-eslint/no-unsafe-argument */

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
configure({ adapter: new Adapter() });

describe('Create Account', () => {
  let wrapper: ReactWrapper;
  let onActionStub: jest.Mock;
  const exampleAccount = {
    address: 'HjoBp62cvsWDA3vtNMWxz6c9q13ReEHi9UGHK7JbZweH5g5',
    seed: 'horse battery staple correct'
  };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const mountComponent = (): ReactWrapper => mount(
    <ActionContext.Provider value={onActionStub}>
      <ThemeProvider theme={themes.dark}>
        <CreateAccount />
      </ThemeProvider>
    </ActionContext.Provider>
  );

  const check = (input: ReactWrapper): unknown => input.simulate('change', { target: { checked: true } });

  const type = async (input: ReactWrapper, value: string): Promise<void> => {
    input.simulate('change', { target: { value } });
    await act(flushAllPromises);
    wrapper.update();
  };

  const enterName = (name: string): Promise<void> => type(wrapper.find('input').first(), name);
  const password = (password: string) => (): Promise<void> => type(wrapper.find('input[type="password"]').first(), password);
  const repeat = (password: string) => (): Promise<void> => type(wrapper.find('input[type="password"]').last(), password);

  beforeEach(async () => {
    onActionStub = jest.fn();
    jest.spyOn(messaging, 'createSeed').mockResolvedValue(exampleAccount);
    jest.spyOn(messaging, 'createAccountSuri').mockResolvedValue(true);
    wrapper = mountComponent();
    await act(flushAllPromises);
    wrapper.update();
  });

  describe('Phase 1', () => {
    it('shows seed phrase in textarea', () => {
      expect(wrapper.find('textarea').text()).toBe(exampleAccount.seed);
    });

    it('next step button is disabled when checkbox is not checked', () => {
      expect(wrapper.find('.uik-button').first().prop('disabled')).toBe(true);
    });

    it('close button exists', () => {
      expect(wrapper.find(Header).find('.popup__close-btn').exists()).toBe(true);
    });

    it('clicking "Cancel" redirects to main screen', () => {
      wrapper.find(Header).find('.popup__close-btn').simulate('click');
      expect(onActionStub).toBeCalledWith('/');
    });

    it('checking the checkbox enables the Next button', () => {
      expect(wrapper.find('.uik-button').first().prop('disabled')).toBe(true);
      check(wrapper.find('input[type="checkbox"]'));

      expect(wrapper.find('.uik-button').first().prop('disabled')).toBe(false);
    });

    it('clicking on Next activates phase 2', () => {
      check(wrapper.find('input[type="checkbox"]'));
      wrapper.find('button.uik-button').simulate('click');
      expect(wrapper.find(Header).text()).toBe('Create an account2/2Close');
    });
  });

  describe('Phase 2', () => {
    beforeEach(async () => {
      check(wrapper.find('input[type="checkbox"]'));
      wrapper.find('button.uik-button').simulate('click');
      await act(flushAllPromises);
      wrapper.update();
    });

    it('saves account with provided network, name and password', async () => {
      const kusamaGenesis = '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe';

      wrapper.find('select').simulate('change', { target: { value: kusamaGenesis } });
      await act(flushAllPromises);
      wrapper.update();

      await enterName('abc').then(password('abcdef')).then(repeat('abcdef'));
      wrapper.find('[data-button-action="add new root"] button').simulate('click');
      await act(flushAllPromises);

      expect(messaging.createAccountSuri).toBeCalledWith('abc', 'abcdef', exampleAccount.seed, 'sr25519', kusamaGenesis);
      expect(onActionStub).toBeCalledWith(`/bind?bindAddress=${exampleAccount.address}`);
    });
  });
});
