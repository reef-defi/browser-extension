// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Uik from '@reef-defi/ui-kit';
import React, { useCallback, useState } from 'react';

import { ButtonArea, Checkbox, MnemonicSeed, VerticalSpace, Warning } from '../../components';
import useToast from '../../hooks/useToast';
import useTranslation from '../../hooks/useTranslation';

interface Props {
  onNextStep: () => void;
  seed: string;
}

const onCopy = (): void => {
  const mnemonicSeedTextElement = document.querySelector('textarea');

  if (!mnemonicSeedTextElement) {
    return;
  }

  mnemonicSeedTextElement.select();
  document.execCommand('copy');
};

function Mnemonic ({ onNextStep, seed }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [isMnemonicSaved, setIsMnemonicSaved] = useState(false);
  const { show } = useToast();

  const _onCopy = useCallback((): void => {
    onCopy();
    show(t('Copied'));
  }, [show, t]);

  return (
    <>
      <MnemonicSeed
        onCopy={_onCopy}
        seed={seed}
      />
      <Warning>
        {t<string>("Please write down your wallet's mnemonic seed and keep it in a safe place. The mnemonic can be used to restore your wallet. Keep it carefully to not lose your assets.")}
      </Warning>
      <VerticalSpace />
      <Checkbox
        checked={isMnemonicSaved}
        label={t<string>('I have saved my mnemonic seed safely.')}
        onChange={setIsMnemonicSaved}
      />
      <ButtonArea>
        <Uik.Button
          className='uik-button--fullWidth'
          rounded
          fill
          size='large'
          disabled={!isMnemonicSaved}
          icon={faArrowRight}
          iconPosition='right'
          onClick={onNextStep}>
          {t<string>('Next step')}
        </Uik.Button>
      </ButtonArea>
    </>
  );
}

export default React.memo(Mnemonic);
