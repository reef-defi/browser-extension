import React, {useCallback, useContext} from "react";
import {ActionContext} from "@reef-defi/extension-ui/components";
import styled from "styled-components";

interface FooterComp {
}

function FooterComp(): React.ReactElement<FooterComp> {
  const onAction = useContext(ActionContext);
  // const selectedAccount = useObservableState(appState.selectedSigner$)
  const openRoute = useCallback(
    (path: string) => onAction(path),
    [onAction]
  );

  return (<div className='nav-content nav-footer navigation d-flex d-flex-space-between'>
    <nav className="d-flex justify-content-end d-flex-vert-center">
      <ul className="navigation_menu-items ">
        <li className="navigation_menu-items_menu-item _text-color-dark-accent">
          <a href='#'
             className="navigation_menu-items_menu-item_link"
             onClick={(ev) => {
               ev.stopPropagation();
               ev.preventDefault();
               openRoute('/')
             }}>Dashboard</a></li>
        <li className="navigation_menu-items_menu-item">
          <a className="navigation_menu-items_menu-item_link"
             href='#'
             onClick={(ev) => {
               ev.stopPropagation();
               ev.preventDefault();
               openRoute('/transfer')
             }}>Send</a></li>
        <li className="navigation_menu-items_menu-item">
          <a className="navigation_menu-items_menu-item_link"
             href='#'
             onClick={(ev) => {
               ev.stopPropagation();
               ev.preventDefault();
               openRoute('/swap')
             }}>Swap</a></li>
      </ul>
    </nav>
  </div>)
}

export const FooterComponent = styled(FooterComp)`
  background: #ccc;
  .nav-header{background: #000;}
  `;
