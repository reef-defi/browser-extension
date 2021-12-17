import {Components} from "@reef-defi/react-lib";
import {useObservableState} from "../hooks/useObservableState";
import {reloadSignersBalanceSubject, selectedSigner$} from "../state/accountState";
import {selectedNetwork$} from "../state/providerState";
import {allAvailableSignerTokens$} from "../state/tokenState";
import React, {useContext} from "react";
import {SigningReqContext} from "@reef-defi/extension-ui/components";
import Signing from "@reef-defi/extension-ui/Popup/Signing";

export const Swap = (): JSX.Element => {
  const signer = useObservableState(selectedSigner$);
  const network = useObservableState(selectedNetwork$);
  const availableTokens = useObservableState(allAvailableSignerTokens$);
  const signRequests = useContext(SigningReqContext);
  return (
    <>
      {
        <div className={(signRequests && signRequests.length) ? 'd-none' : undefined}>
          {!!signer && !!network && !!availableTokens && !!availableTokens.length &&
          <Components.SwapComponent account={signer} network={network} tokens={availableTokens}
                                    reloadTokens={reloadSignersBalanceSubject.next} notify={() => {
          }}></Components.SwapComponent>}
        </div>
      }
      {(!!signRequests && !!signRequests.length) && <Signing/>}
    </>
  );
}
