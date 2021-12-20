import React from 'react';
import {SigningOrChildren} from "./SigningOrChildren";
import {EvmBindComponent} from "./EvmBindComponent";
import {useObservableState} from "../hooks/useObservableState";
import {appState} from "../state"

export const Bind = (): JSX.Element => {
  // const provider = useObservableState(appState.provider$);
  const accounts = useObservableState(appState.signers$);
  const selectedSigner = useObservableState(appState.selectedSigner$);
  //
  // const signRequests = useContext(SigningReqContext);

  return (
    <SigningOrChildren>
      {selectedSigner && <EvmBindComponent signer={selectedSigner} signers={accounts}></EvmBindComponent>}
    </SigningOrChildren>
  );
};
