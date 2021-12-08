import React, {useCallback, useContext, useEffect} from "react";
import {ActionContext} from "@reef-defi/extension-ui/components";
import styled from "styled-components";
import {useObservableState} from "../../../reef/extension-ui/hooks/useObservableState";
import {selectedSigner$} from "../../../reef/extension-ui/appState/accountState";

interface NavHeaderComp  {
}

function NavHeaderComp(): React.ReactElement<NavHeaderComp> {
  const onAction = useContext(ActionContext);
  const  selectedAccount = useObservableState(selectedSigner$)
  // const [provider] = useSubjectState<Provider>(appProvider$);
  // const settings = useContext(SettingsContext);
  const _onClick = useCallback(
    ()=>console.log('SSSS', selectedAccount?.name),
    // () => onAction('/send'),
    [onAction, selectedAccount]
  );

  useEffect(() => {
    console.log("SEALLLL=",selectedAccount);
  }, [selectedAccount]);


  return (<div className='nav-header'>Reef  <button onClick={_onClick}>send</button> {selectedAccount?.name}</div>)
}

export const NavHeader = styled(NavHeaderComp) `
  background: #ccc;
  .nav-header{background: #ccc;}
  `;
