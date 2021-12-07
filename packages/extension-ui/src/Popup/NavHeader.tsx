import React, {useCallback, useContext} from "react";
import {AccountContext, ActionContext} from "@reef-defi/extension-ui/components";
import styled from "styled-components";
import {useSubjectState} from "../../../reef/extension-ui/hooks/useSubjectState";
import {appProvider$} from "../../../reef/extension-ui/model/appState";
import {Provider} from "@reef-defi/evm-provider";
import {hooks, utils} from "@reef-defi/react-lib";

interface NavHeaderComp  {
}

function NavHeaderComp(): React.ReactElement<NavHeaderComp> {
  const onAction = useContext(ActionContext);
  const { selectedAccount } = useContext(AccountContext);
  const [provider] = useSubjectState<Provider>(appProvider$);
  // const settings = useContext(SettingsContext);
  const _onClick = useCallback(
    () => onAction('/send'),
    [onAction]
  );

  hooks.useAsyncEffect(async () => {
    console.log("ppBBBlock=",await utils.getData(provider)?.getBlockNumber());
  }, [provider]);

  return (<div className='nav-header'>Reef  <button onClick={_onClick}>send</button> {selectedAccount?.name}</div>)
}

export const NavHeader = styled(NavHeaderComp) `
  background: #ccc;
  .nav-header{background: #ccc;}
  `;
