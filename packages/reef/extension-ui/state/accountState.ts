import {
  combineLatest, distinctUntilChanged, map, of, ReplaySubject,
  shareReplay, switchMap, Subject, withLatestFrom, merge, Observable, tap,
} from "rxjs";
import {AccountJson} from "@reef-defi/extension-base/background/types";
import {toReefSigner} from "./util";
import Signer from "@reef-defi/extension-base/page/Signer";
import {provider$} from "./appState";
import {ReefSigner, rpc} from "@reef-defi/react-lib";
import {sendMessage} from "@reef-defi/extension-ui/messaging";
import {BigNumber} from "ethers";
import {
  getAddressUpdateActionTypes,
  getUnwrappedData$,
  getUpdAddresses,
  isUpdateAll,
  UpdateAction,
  UpdateDataCtx,
  UpdateDataType
} from "./updateCtxUtil";

const injectionSigner = new Signer(sendMessage);

// accepting only one callback so setting in Popup - subscribAccounts(accs => accounts$.next(accs));
export const accounts$ = new ReplaySubject<AccountJson[] | null>(1);
// also reloads signer tokens since emits signers$
export const reloadSignersSubject = new Subject<UpdateDataCtx<ReefSigner[]>>();

const signersFromAccounts$ = combineLatest([provider$, of(injectionSigner), accounts$]).pipe(
  switchMap(([provider, signer, accounts]) => {
    if (!accounts || !accounts.length) {
      return of([]);
    }
    return Promise.all<ReefSigner>(accounts.map(acc => toReefSigner(acc, provider, signer)));
  }),
  map(data => ({data, updateActions: [{type: UpdateDataType.ACCOUNT_TOKENS}, {type: UpdateDataType.ACCOUNT_NATIVE_BALANCE}, {type:UpdateDataType.ACCOUNT_EVM_BINDING}]} as UpdateDataCtx<ReefSigner[]>)),
  shareReplay(1)
);


const getSignersToUpdate = (updateType: UpdateDataType, updateActions: UpdateAction[], signers: ReefSigner[]) => {
  const updAddresses = getUpdAddresses(updateType, updateActions );
  return isUpdateAll(updAddresses) ? signers : signers.filter(sig => updAddresses?.some(addr => addr === sig.address));
}

const replaceUpdatedSigners = (updatedSigners: ReefSigner[], existingSigners: ReefSigner[]) => {
  return existingSigners.map(existingSig => updatedSigners.find(updSig => updSig.address === existingSig.address) || existingSig);
};

const updateSignersBalances = (updateActions: UpdateAction[], signers: ReefSigner[], provider: any): Promise<ReefSigner[]> => {
  const updSigners = getSignersToUpdate(UpdateDataType.ACCOUNT_NATIVE_BALANCE, updateActions, signers)
  return Promise.all(updSigners.map((sig: ReefSigner) => rpc.getReefCoinBalance(sig.address, provider)))
    .then((balances: BigNumber[]) => balances.map((balance: BigNumber, i: number) => {
      const sig = updSigners[i];
      console.log("UPDATING SIGNER BALANCE=",sig.name, sig.address, balance);
      return {...sig, balance};
    })).then((updated) => replaceUpdatedSigners(updated, signers));
}

const updateSignersEvmBindings = (updateActions: UpdateAction[], signers: ReefSigner[], provider: any): Promise<ReefSigner[]> => {
  const updSigners = getSignersToUpdate(UpdateDataType.ACCOUNT_EVM_BINDING, updateActions, signers);
  return Promise.all(updSigners.map((sig: ReefSigner) => sig.signer.isClaimed()))
    .then((claimed: boolean[]) => claimed.map((isEvmClaimed: boolean, i: number) => {
      const sig = updSigners[i];
      console.log("UPDATING SIGNER EVM=",sig.name, isEvmClaimed);
      return {...sig, isEvmClaimed};
    })).then((updated) => replaceUpdatedSigners(updated, signers));
}

const signersWithReloadedData$ = reloadSignersSubject.pipe(
  withLatestFrom(combineLatest([signersFromAccounts$, provider$])),
  switchMap(([updateCtx, [signersCtx, provider]]) => updateSignersBalances(updateCtx.updateActions, signersCtx.data as ReefSigner[], provider)
    .then(updatedSigners => ({
      data: updatedSigners,
      updateActions: updateCtx.updateActions,
      ctx: {provider}
    } as UpdateDataCtx<ReefSigner[]>))
  ),
  switchMap((updateCtx: UpdateDataCtx<ReefSigner[]>) => updateSignersEvmBindings(updateCtx.updateActions, updateCtx.data as ReefSigner[], updateCtx.ctx.provider)
    .then(updatedSigners => ({
      data: updatedSigners,
      updateActions: updateCtx.updateActions
    } as UpdateDataCtx<ReefSigner[]>))
  )
);

const signersUpdateCtx$: Observable<UpdateDataCtx<ReefSigner[]>> = merge(signersFromAccounts$, signersWithReloadedData$).pipe(
  shareReplay(1)
);

export const signers$: Observable<ReefSigner[]> = getUnwrappedData$(signersUpdateCtx$);

export const selectAddressSubj = new ReplaySubject<string | undefined>(1);
selectAddressSubj.next(localStorage.getItem('selected_address_reef') || undefined);

export const selectedSignerUpdateCtx$ = combineLatest([selectAddressSubj.pipe(distinctUntilChanged()), signersUpdateCtx$]).pipe(
  map(([selectedAddress, signersCtx]) => {
    let foundSigner = signersCtx.data?.find((rs: ReefSigner) => rs.address === selectedAddress);
    let selectedAddressUpdateActions: UpdateAction[] = [];
    if(!!foundSigner){
      const updateTypes = getAddressUpdateActionTypes(selectedAddress, signersCtx.updateActions);
      selectedAddressUpdateActions = updateTypes.map(ut => ({
        address: foundSigner?.address,
        type: ut
      })) as UpdateAction[];
    }else {
      foundSigner = signersCtx.data ? signersCtx.data[0] : undefined;
      selectedAddressUpdateActions = [{
        address: foundSigner?.address,
        type: UpdateDataType.ACCOUNT_EVM_BINDING
      },{
        address: foundSigner?.address,
        type: UpdateDataType.ACCOUNT_TOKENS
      },{
        address: foundSigner?.address,
        type: UpdateDataType.ACCOUNT_NATIVE_BALANCE
      }] as UpdateAction[];
    }

    localStorage.setItem('selected_address_reef', foundSigner?.address || '');
    return {data:{...foundSigner}, updateActions: selectedAddressUpdateActions} as UpdateDataCtx<ReefSigner>;
  }),
  tap(v => console.log('SELECTED SIGNR ch=', v)),
  shareReplay(1)
);

export const selectedSigner$ = getUnwrappedData$(selectedSignerUpdateCtx$);
