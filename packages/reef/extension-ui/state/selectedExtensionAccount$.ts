import { Observable, shareReplay } from 'rxjs';

import { subscribeSelectedAccount } from '../messaging';

export default (new Observable((subscriber) => {
  subscribeSelectedAccount((selected) => subscriber.next(selected))
    .catch((error: Error) => console.log('Error subscribeSelectedAccount', error));
}))
  .pipe(
    shareReplay(1)
  );
