import {Components} from "@reef-defi/react-lib";
import {useObservableState} from "../hooks/useObservableState";
import {selectedSigner$} from "../state/accountState";
import {selectedNetwork$} from "../state/providerState";
import {allAvailableSignerTokens$} from "../state/tokenState";
import React from "react";
import {onTxUpdateReloadSignerBalances} from "../state/util";
import {SigningOrChildren} from "./SigningOrChildren";

export const Swap = (): JSX.Element => {
  const signer = useObservableState(selectedSigner$);
  const network = useObservableState(selectedNetwork$);
  const availableTokens = useObservableState(allAvailableSignerTokens$);
  return (
    <SigningOrChildren>
          {!!signer && !!network && !!availableTokens && !!availableTokens.length &&
          <Components.SwapComponent account={signer} network={network} tokens={availableTokens}
                                    onTxUpdate={onTxUpdateReloadSignerBalances}></Components.SwapComponent>}
    </SigningOrChildren>
  );
}
