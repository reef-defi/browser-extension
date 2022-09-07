import Injected from '@reef-defi/extension-base/page/Injected';
import { SendRequest } from '@reef-defi/extension-base/page/types';

import { ReefInjected as RInjected } from '../../../extension-inject/types';
import { ReefSigners } from './ReefSigners';

export class ReefInjected extends Injected implements RInjected {
  public readonly accountSigner: ReefSigners;

  constructor (sendRequest: SendRequest) {
    super(sendRequest);
    this.accountSigner = new ReefSigners(this.accounts, this.signer);
  }
}
