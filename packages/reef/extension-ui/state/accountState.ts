import {
  combineLatest,
  distinctUntilChanged,
  map,
  mergeScan,
  Observable,
  of,
  ReplaySubject,
  scan,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  withLatestFrom,
} from "rxjs";
import {AccountJson} from "@reef-defi/extension-base/background/types";
import {toReefSigner} from "./util";
import Signer from "@reef-defi/extension-base/page/Signer";
import {provider$} from "./appState";
import {ReefSigner} from "@reef-defi/react-lib";
import {sendMessage} from "@reef-defi/extension-ui/messaging";
import {
  getAddressUpdateActionTypes,
  getUnwrappedData$,
  UpdateAction,
  UpdateDataCtx,
  UpdateDataType
} from "./updateCtxUtil";
import {replaceUpdatedSigners, updateSignersBalances, updateSignersEvmBindings} from "./accountStateUtil";

const injectionSigner = new Signer(sendMessage);

export const accounts$ = new ReplaySubject<AccountJson[] | null>(1);
export const reloadSignersSubject = new Subject<UpdateDataCtx<ReefSigner[]>>();

const signersInjected$ = combineLatest([provider$, of(injectionSigner), accounts$]).pipe(
  switchMap(([provider, signer, accounts]) => {
    if (!accounts || !accounts.length) {
      return of([]);
    }
    return Promise.all<ReefSigner>(accounts.map(acc => toReefSigner(acc, provider, signer)));
  }),
  map(data => ({
    data,
    updateActions: [{type: UpdateDataType.ACCOUNT_TOKENS}, {type: UpdateDataType.ACCOUNT_NATIVE_BALANCE}, {type: UpdateDataType.ACCOUNT_EVM_BINDING}]
  } as UpdateDataCtx<ReefSigner[]>)),
  shareReplay(1)
);


const signersWithUpdatedData$ = reloadSignersSubject.pipe(
  withLatestFrom(combineLatest([signersInjected$, provider$])),
  mergeScan((state: { allUpdated: ReefSigner[], lastUpdatedSigners: ReefSigner[], lastUpdateActions: UpdateAction[] }, [updateCtx, [signersInjectedCtx, provider]]): any => {
    const allUpdatedSigners = replaceUpdatedSigners(signersInjectedCtx.data, state.allUpdated);
    return of(updateCtx.updateActions).pipe(
      switchMap((updateActions) => updateSignersBalances(updateActions, allUpdatedSigners, provider)
        .then(updatedSigners => ({
          allUpdated: replaceUpdatedSigners(state.allUpdated, updatedSigners, true),
          lastUpdatedSigners: updatedSigners,
          lastUpdateActions: updateActions
        }))
        .then(newState => updateSignersEvmBindings(newState.lastUpdateActions, newState.allUpdated)
          .then(updatedSigners => ({
              allUpdated: replaceUpdatedSigners(newState.allUpdated, updatedSigners, true),
              lastUpdatedSigners: replaceUpdatedSigners(newState.lastUpdatedSigners, updatedSigners, true),
              lastUpdateActions: newState.lastUpdateActions
            })
          )
        )
      )
    );
  }, {allUpdated: [], lastUpdatedSigners: [], lastUpdateActions: []}),
  map((val: any): any => ({
    data: val.lastUpdatedSigners,
    updateActions: val.lastUpdateActions
  } as UpdateDataCtx<ReefSigner[]>)),
  shareReplay(1)
);

const signersUpdateCtx$: Observable<UpdateDataCtx<ReefSigner[]>> = combineLatest({
  injectedSigners: signersInjected$,
  updatedSigners: signersWithUpdatedData$.pipe(startWith(null))
}).pipe(
  scan((stateVal: any, currentVal) => {
    let updatedSignersCtx: UpdateDataCtx<ReefSigner[]>;
    if (stateVal.lastInjectedSigners !== currentVal.injectedSigners) {
      updatedSignersCtx = currentVal.injectedSigners;
    } else {
      let updatedSig = replaceUpdatedSigners(stateVal.currentValue.data, currentVal.updatedSigners.data);
      updatedSignersCtx = {data: updatedSig, updateActions: currentVal.updatedSigners.updateActions}
    }
    return {
      currentValue: updatedSignersCtx,
      lastInjectedSigners: currentVal.injectedSigners,
    }
  }, {
    currentValue: ({updateActions: [], data: []} as UpdateDataCtx<ReefSigner[]>),
    lastInjectedSigners: null,
  }),
  map(v => v.currentValue),
  shareReplay(1)
);

export const signers$: Observable<ReefSigner[]> = getUnwrappedData$(signersUpdateCtx$);

export const selectAddressSubj = new ReplaySubject<string | undefined>(1);
selectAddressSubj.next(localStorage.getItem('selected_address_reef') || undefined);

export const selectedSignerUpdateCtx$ = combineLatest([selectAddressSubj.pipe(distinctUntilChanged()), signersUpdateCtx$]).pipe(
  map(([selectedAddress, signersCtx]) => {
    let foundSigner = signersCtx.data?.find((rs: ReefSigner) => rs.address === selectedAddress);
    let selectedAddressUpdateActions: UpdateAction[] = [];
    if (!!foundSigner) {
      const updateTypes = getAddressUpdateActionTypes(selectedAddress, signersCtx.updateActions);
      selectedAddressUpdateActions = updateTypes.map(ut => ({
        address: foundSigner?.address,
        type: ut
      })) as UpdateAction[];
    } else {
      foundSigner = signersCtx.data ? signersCtx.data[0] : undefined;
      selectedAddressUpdateActions = [{
        address: foundSigner?.address,
        type: UpdateDataType.ACCOUNT_EVM_BINDING
      }, {
        address: foundSigner?.address,
        type: UpdateDataType.ACCOUNT_TOKENS
      }, {
        address: foundSigner?.address,
        type: UpdateDataType.ACCOUNT_NATIVE_BALANCE
      }] as UpdateAction[];
    }

    localStorage.setItem('selected_address_reef', foundSigner?.address || '');
    return {data: {...foundSigner}, updateActions: selectedAddressUpdateActions} as UpdateDataCtx<ReefSigner>;
  }),
  shareReplay(1)
);

export const selectedSigner$ = getUnwrappedData$(selectedSignerUpdateCtx$);
