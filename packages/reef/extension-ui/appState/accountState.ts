import {BehaviorSubject, combineLatest, map, of, ReplaySubject, shareReplay, switchMap} from "rxjs";
import {AccountJson} from "@reef-defi/extension-base/background/types";
import {toReefSigner} from "./util";
import {subscribeSelectedAccount} from "../messaging-reef";
import Signer from "@reef-defi/extension-base/page/Signer";
import {provider$} from "./appState";
import {sendMessage} from "@reef-defi/extension-base/page";

const injectionSigner$ = new BehaviorSubject(new Signer(sendMessage));

export const accounts$ = new ReplaySubject<AccountJson[] | null>(1);
// accepting only one callback so setting in Popup - subscribAccounts(accs => accounts$.next(accs));
export const signers$ = combineLatest([provider$, injectionSigner$, accounts$]).pipe(
  switchMap(([provider, signer, accounts]) => {
    if (!accounts || !accounts.length) {
      return of([]);
    }
    return Promise.all( accounts.map(acc => toReefSigner(acc, provider, signer)));
  }),
  shareReplay(1)
);

const appSelectedAccount$ = new ReplaySubject<{ address: string } | null>(1);
subscribeSelectedAccount(selAcc => {
  console.log("SUBSSS sel acc=", selAcc);
  appSelectedAccount$.next(selAcc)
});
export const selectedSigner$ = combineLatest([appSelectedAccount$, signers$]).pipe(
  map(([sel,signers])=>{
    console.log("aaaa=",signers);
    return signers.find((rs: any) => rs.address === sel?.address);
  }),
  shareReplay(1)
);
provider$.subscribe((val) => {
  console.log("provider=", val);
})
selectedSigner$.subscribe((val) => {
  console.log("selSIgner=", val);
})
