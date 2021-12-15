import React, {useCallback, useContext} from "react";
import {ActionContext} from "@reef-defi/extension-ui/components";
import {handleTxResponse} from "@reef-defi/evm-provider/utils";
import styled from "styled-components";
import {useObservableState} from "../../../reef/extension-ui/hooks/useObservableState";
import {appState} from "../state";
import {Provider} from "@reef-defi/evm-provider";
import {ReefSigner} from "@reef-defi/react-lib";
import {BigNumber} from "ethers";

interface NavHeaderComp {
}

function NavHeaderComp(): React.ReactElement<NavHeaderComp> {
  const onAction = useContext(ActionContext);
  // const provider = useObservableState(appState.provider$)
  // const accounts = useObservableState(appState.signers$)
  const selectedAccount = useObservableState(appState.selectedSigner$)
  const _onClick = useCallback(
    () => onAction('/transfer'),
    [onAction]
  );
  const _onRoot = useCallback(
    () => onAction('/'),
    [onAction]
  );
  const _onTokens = useCallback(
    () => onAction('/tokens'),
    [onAction]
  );
  /*const _onSign = useCallback(
    () => {
      // onAction('/auth-list')
      if (provider && accounts) {
        sendToNativeAddress(provider, accounts[0], utils.parseEther('1'), accounts[1].address);
      }
    },
    [onAction, provider, accounts]
  );*/

  // @ts-ignore
  async function sendToNativeAddress(provider: Provider, signer: ReefSigner, toAmt: BigNumber, to: string): Promise<void> {
    const transfer = provider.api.tx.balances.transfer(to, toAmt.toString());
    const substrateAddress = await signer.signer.getSubstrateAddress();
    console.log("SENDDDD=", transfer, substrateAddress);
    transfer.signAndSend(substrateAddress, {signer: signer.signer.signingKey},
      (res) => handleTxResponse(res, provider.api).then(
        (txRes: any): void => {
          const txHash = transfer.hash.toHex();
          console.log("SIGNED tx==",txHash);
          // txHandler({
          //   txIdent, txHash, isInBlock: txRes.result.status.isInBlock, isComplete: txRes.result.status.isFinalized,
          // });
        },
      ).catch((rej: any) => {
        // finalized error is ignored
        if (rej.result.status.isInBlock) {
          // const txHash = transfer.hash.toHex();
          // handleErr(rej.message, txIdent, txHash, txHandler);
        }
      })).catch((e) => {
      console.log('sendToNativeAddress err=', e);
      // handleErr(e, txIdent, '', txHandler);
    });
  }

  return (<div className='nav-header'>Reef
    <button onClick={_onClick}>send</button>
    {/*<button onClick={_onSign}>sign</button>*/}
    <button onClick={_onTokens}>tokens</button>
    <button onClick={_onRoot}>root</button>
    {selectedAccount?.address.substr(selectedAccount.address.length-6)}
  </div>)
}

export const NavHeader = styled(NavHeaderComp)`
  background: #ccc;
  .nav-header{background: #ccc;}
  `;
