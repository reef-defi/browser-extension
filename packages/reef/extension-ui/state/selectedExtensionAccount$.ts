import { Observable, shareReplay } from 'rxjs';

import { subscribeSelectedAccount } from '../messaging';

export default (new Observable((subscriber) => {
  subscribeSelectedAccount((selected) => subscriber.next(selected))
    .catch((reason) => console.log('Error subscribing selected account', reason));
}))
  .pipe(
    shareReplay(1)
  );
