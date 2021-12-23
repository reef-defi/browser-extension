import {Pool, ReefSigner, rpc, Token, TokenWithAmount, utils} from "@reef-defi/react-lib";
import {AccountJson} from "@reef-defi/extension-base/background/types";
import {Provider} from "@reef-defi/evm-provider";
import Signer from "@reef-defi/extension-base/page/Signer";
import {InjectedAccountWithMeta} from "@reef-defi/extension-inject/types";
import {reloadSignersSubject} from "./accountState";
import {UpdateAction} from "./updateCtxUtil";

export const combineTokensDistinct = ([tokens1, tokens2 ]:[Token[], Token[]])=>{
  const combinedT = [...tokens1];
  tokens2.forEach((vT: Token) => !combinedT.some(cT => cT.address === vT.address) ? combinedT.push(vT) : null);
  return combinedT;
};

export const toTokensWithPrice = ([tokens, reefPrice, pools]:[Token[], number, Pool[]])=>{
  return tokens.map(token=>({...token, price: utils.calculateTokenPrice(token, pools, reefPrice)} as TokenWithAmount))
};

export function toReefSigner(acc: AccountJson, provider: Provider, injectionSigner: Signer): Promise<ReefSigner> {
  const accWithMeta: InjectedAccountWithMeta = {
    address: acc.address,
    meta: {
      genesisHash: acc.genesisHash,
      name: acc.name,
      source: acc.name || ''
    },
    type: acc.type
  };
  return rpc.accountToSigner(accWithMeta, provider, injectionSigner);
}

export const onTxUpdateReloadSignerBalances = (txUpdateData: utils.TxStatusUpdate, updateActions: UpdateAction[]): void => {
  if (txUpdateData?.isInBlock || txUpdateData?.error) {
    const delay = txUpdateData.txTypeEvm ? 2000 : 0;
    setTimeout(() => reloadSignersSubject.next({updateActions}), delay);
  }
};
