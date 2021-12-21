import {
  combineLatest, distinctUntilChanged, map, of, ReplaySubject,
  shareReplay, switchMap, Subject, withLatestFrom, merge, Observable, filter
} from "rxjs";
import {AccountJson} from "@reef-defi/extension-base/background/types";
import {toReefSigner} from "./util";
import Signer from "@reef-defi/extension-base/page/Signer";
import {provider$} from "./appState";
import {ReefSigner, rpc} from "@reef-defi/react-lib";
import {sendMessage} from "@reef-defi/extension-ui/messaging";
import {BigNumber} from "ethers";

const injectionSigner = new Signer(sendMessage);

// accepting only one callback so setting in Popup - subscribAccounts(accs => accounts$.next(accs));
export const accounts$ = new ReplaySubject<AccountJson[] | null>(1);
// also reloads signer tokens since emits signers$
export const reloadSignersBalanceSubject = new Subject<void>();

const signersFromAccounts$ = combineLatest([provider$, of(injectionSigner), accounts$]).pipe(
  switchMap(([provider, signer, accounts]) => {
    if (!accounts || !accounts.length) {
      return of([]);
    }
    return Promise.all<ReefSigner>(accounts.map(acc => toReefSigner(acc, provider, signer)));
  }),
  shareReplay(1)
);

const signersWithReloadedBalances$ = reloadSignersBalanceSubject.pipe(
  withLatestFrom(combineLatest([signersFromAccounts$, provider$])),
  switchMap(([_, [signers, provider]]) => {
    return Promise.all(signers.map((sig: ReefSigner) => rpc.getReefCoinBalance(sig.address, provider)))
      .then((balances: BigNumber[]) => balances.map((balance: BigNumber, i: number) => {
        const sig = signers[i];
        sig.balance = balance;
        return sig;
      }));
  })
);
export const reloadSignerEvmBindingSubject = new Subject<string>();
const signersWithReloadedEvmBindings$ = reloadSignerEvmBindingSubject.pipe(
  withLatestFrom(combineLatest([signersFromAccounts$, provider$])),
  switchMap(([reloadSignerAddress, [signers, provider]]) => {
    const reloadSigner = signers.find(sig => sig.address === reloadSignerAddress||sig.evmAddress===reloadSignerAddress);
    if (reloadSigner) {
      return reloadSigner.signer.isClaimed().then((isClaimed) => {
        reloadSigner.isEvmClaimed = isClaimed;
        return [...signers];
      });
    }
    return Promise.resolve(null);
  }),
  filter(v=>!!v)
) as Observable<ReefSigner[]>;
export const signers$: Observable<ReefSigner[]> = merge(signersFromAccounts$, signersWithReloadedBalances$, signersWithReloadedEvmBindings$);

export const selectAddressSubj = new ReplaySubject<string | undefined>(1);
selectAddressSubj.next(localStorage.getItem('selected_address_reef') || undefined);
export const selectedSigner$ = combineLatest([selectAddressSubj.pipe(distinctUntilChanged()), signers$]).pipe(
  map(([selectedAddress, signers]) => {
    let foundSigner = signers.find((rs: ReefSigner) => rs.address === selectedAddress);
    if (!foundSigner) {
      foundSigner = signers[0];
    }
    localStorage.setItem('selected_address_reef', foundSigner?.address || '');
    return {...foundSigner};
  }),
  shareReplay(1)
);
