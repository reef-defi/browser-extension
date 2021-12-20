import React, {useContext} from 'react';
import Signing from "@reef-defi/extension-ui/Popup/Signing";
import {SigningReqContext} from "@reef-defi/extension-ui/components";

interface SigningOrComponent{
  children: any;
}

export const SigningOrChildren = ({children}: SigningOrComponent): JSX.Element => {
  const signRequests = useContext(SigningReqContext);

  return (
    <>
      {
        <div className={(signRequests && signRequests.length) ? 'd-none' : undefined}>
          {children}
        </div>
      }
      {(!!signRequests && !!signRequests.length) && <Signing/>}
    </>
  );
};
