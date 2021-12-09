import {combineLatest, distinctUntilChanged, map, of, ReplaySubject, shareReplay, switchMap} from "rxjs";
import {AccountJson} from "@reef-defi/extension-base/background/types";
import {toReefSigner} from "./util";
import Signer from "@reef-defi/extension-base/page/Signer";
import {provider$} from "./appState";
import {sendMessage} from "@reef-defi/extension-base/page";
import {ReefSigner} from "@reef-defi/react-lib";

const injectionSigner = new Signer(sendMessage);

// accepting only one callback so setting in Popup - subscribAccounts(accs => accounts$.next(accs));
export const accounts$ = new ReplaySubject<AccountJson[] | null>(1);

export const signers$ = combineLatest([provider$, of(injectionSigner), accounts$]).pipe(
  switchMap(([provider, signer, accounts]) => {
    if (!accounts || !accounts.length) {
      return of([]);
    }
    return Promise.all<ReefSigner>(accounts.map(acc => toReefSigner(acc, provider, signer)));
  }),
  shareReplay(1)
);

export const selectAddressSubj = new ReplaySubject<string | undefined>(1);
selectAddressSubj.next(localStorage.getItem('selected_address_reef') || undefined);

export const selectedSigner$ = combineLatest([selectAddressSubj.pipe(distinctUntilChanged()), signers$]).pipe(
  map(([selectedAddress, signers]) => {
    let foundSigner = signers.find((rs: ReefSigner) => rs.address === selectedAddress);
    if (!foundSigner) {
      foundSigner = signers[0];
    }
    localStorage.setItem('selected_address_reef', foundSigner?.address || '');
    return foundSigner;
  }),
  shareReplay(1)
);
