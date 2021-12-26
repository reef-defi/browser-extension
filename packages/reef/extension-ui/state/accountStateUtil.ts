import {getUpdAddresses, isUpdateAll, UpdateAction, UpdateDataType} from "./updateCtxUtil";
import {ReefSigner, rpc} from "@reef-defi/react-lib";
import {BigNumber} from "ethers";

export const getSignersToUpdate = (updateType: UpdateDataType, updateActions: UpdateAction[], signers: ReefSigner[]) => {
  const updAddresses = getUpdAddresses(updateType, updateActions);
  return isUpdateAll(updAddresses) ? signers : signers.filter(sig => updAddresses?.some(addr => addr === sig.address));
}

export const replaceUpdatedSigners = (existingSigners?: ReefSigner[], updatedSigners?: ReefSigner[], appendNew?: boolean) => {
  if (!existingSigners) {
    existingSigners = [];
  }
  if (!appendNew && !existingSigners.length) {
    return existingSigners;
  }
  if (!updatedSigners || !updatedSigners.length) {
    return existingSigners;
  }
  const signers = existingSigners.map(existingSig => updatedSigners.find(updSig => updSig.address === existingSig.address) || existingSig);
  if (!appendNew) {
    return signers
  }
  updatedSigners.forEach((updS) => {
    if (!signers.some(s => s.address === updS.address)) {
      signers.push(updS);
    }
  });
  return signers;
};

export const updateSignersBalances = (updateActions: UpdateAction[], signers: ReefSigner[], provider: any): Promise<ReefSigner[]> => {
  if (!signers || !signers.length) {
    return Promise.resolve([]);
  }
  const updSigners = getSignersToUpdate(UpdateDataType.ACCOUNT_NATIVE_BALANCE, updateActions, signers)
  return Promise.all(updSigners.map((sig: ReefSigner) => rpc.getReefCoinBalance(sig.address, provider)))
    .then((balances: BigNumber[]) => balances.map((balance: BigNumber, i: number) => {
      const sig = updSigners[i];
      return {...sig, balance};
    }))
}

export const updateSignersEvmBindings = (updateActions: UpdateAction[], signers?: ReefSigner[]): Promise<ReefSigner[]> => {
  if (!signers || !signers.length) {
    return Promise.resolve([]);
  }
  const updSigners = getSignersToUpdate(UpdateDataType.ACCOUNT_EVM_BINDING, updateActions, signers);
  return Promise.all(updSigners.map((sig: ReefSigner) => sig.signer.isClaimed()))
    .then((claimed: boolean[]) => claimed.map((isEvmClaimed: boolean, i: number) => {
      const sig = updSigners[i];
      return {...sig, isEvmClaimed};
    }))
}
