import { Observable, shareReplay } from 'rxjs';

import { subscribeSelectedAccount } from '../messaging';

export default (new Observable((subscriber) => {
  subscribeSelectedAccount((selected) => subscriber.next(selected));
}))
  .pipe(
    shareReplay(1)
  );
