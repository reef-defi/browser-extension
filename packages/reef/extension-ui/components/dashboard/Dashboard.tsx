import {TokenBalances} from "./TokenBalances";
import {useObservableState} from "../../hooks/useObservableState";
import {tokenPrices$} from "../../state/tokenState";
import {utils} from "@reef-defi/react-lib"
import "./Dashboard.css";
import React from "react";

export const Dashboard = (): JSX.Element=> {
  const tokensWithPrice = useObservableState(tokenPrices$);
  return (<>
  <TokenBalances tokens={tokensWithPrice||utils.DataProgress.LOADING} onRefresh={()=>{}}></TokenBalances>
  </>)
}
