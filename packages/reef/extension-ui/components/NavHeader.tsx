import React, {useCallback, useContext} from "react";
import {ActionContext} from "@reef-defi/extension-ui/components";
import styled from "styled-components";
import {useObservableState} from "../../../reef/extension-ui/hooks/useObservableState";
import {appState} from "../state";
import {Provider} from "@reef-defi/evm-provider";
import {ReefSigner} from "@reef-defi/react-lib";
import {BigNumber, utils} from "ethers";
import {signPayload} from "@reef-defi/extension-ui/messaging";

interface NavHeaderComp {
}

function NavHeaderComp(): React.ReactElement<NavHeaderComp> {
  const onAction = useContext(ActionContext);
  const provider = useObservableState(appState.provider$)
  const accounts = useObservableState(appState.signers$)
  const selectedAccount = useObservableState(appState.selectedSigner$)
  const _onClick = useCallback(
    () => onAction('/transfer'),
    [onAction]
  );
  const _onRoot = useCallback(
    () => onAction('/'),
    [onAction]
  );
  const _onSign = useCallback(
    () => {
      // onAction('/auth-list')
      console.log("p=",provider, 'a=',accounts);
      if (provider && accounts) {
        sendToNativeAddress(provider, accounts[0], utils.parseEther('1'), accounts[1].address);
      }
    },
    [onAction, provider, accounts]
  );

  // @ts-ignore
  async function sendToNativeAddress(provider: Provider, signer: ReefSigner, toAmt: BigNumber, to: string): Promise<void> {
    const transfer = provider.api.tx.balances.transfer(to, toAmt.toString());
    // const substrateAddress = await signer.signer.getSubstrateAddress();
    // console.log("SENDDDD=", transfer.toJSON());
    /*transfer.signAndSend(substrateAddress, {signer: signer.signer.signingKey},
      // (res) => handleTxResponse(res, provider.api)
      (res: any): void => {
        console.log("RESSS=", res);
      });*/
    const payload = {
      "specVersion": "0x00000008",
      "transactionVersion": "0x00000002",
      "address": "5G9ph7buHNbJSZGpx1DxKMcRhVmH93ao5dMkjt7dVLZkSKsc",
      "blockHash": "0x9ea1aea93282d69872229d97426f845c0ad521d6cb774e6cb6990b7e4e1cf79b",
      "blockNumber": "0x001ac6a0",
      "era": "0x0502",
      "genesisHash": "0x7834781d38e4798d548e34ec947d19deea29df148a7bf32484b7b24dacf8d4b7",
      "method": "0x060000f883abf29701bdefecdccf195b46142c577f509132d757928234fa672c6ac71e13000064a7b3b6e00d",
      "nonce": "0x00000007",
      "signedExtensions": [
        "CheckSpecVersion",
        "CheckTxVersion",
        "CheckGenesis",
        "CheckMortality",
        "CheckNonce",
        "CheckWeight",
        "ChargeTransactionPayment",
        "SetEvmOrigin"
      ],
      "tip": "0x00000000000000000000000000000000",
      "version": 4
    };
    signPayload(payload).then((res) => {
      console.log("!!!!!!SIGN RESSSSss=", res);
    });

  }

  return (<div className='nav-header'>Reef
    <button onClick={_onClick}>send</button>
    <button onClick={_onSign}>sign</button>
    <button onClick={_onRoot}>root</button>
    {selectedAccount?.address}
  </div>)
}

export const NavHeader = styled(NavHeaderComp)`
  background: #ccc;
  .nav-header{background: #ccc;}
  `;
