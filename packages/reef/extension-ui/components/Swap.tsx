import { appState, Components, hooks, Network, ReefSigner, Token, reefTokenWithAmount, createEmptyTokenWithAmount } from '@reef-defi/react-lib'
import React from 'react'
import { SigningOrChildren } from './SigningOrChildren'
import { Loading } from '../uik'

const REEF = reefTokenWithAmount()
const NO_TKN = createEmptyTokenWithAmount()

export const Swap = (): JSX.Element => {
  const signer: ReefSigner | undefined = hooks.useObservableState(appState.selectedSigner$)
  const network: Network | undefined = hooks.useObservableState(appState.selectedNetworkSubj)
  const availableTokens: Token[] | undefined = hooks.useObservableState(appState.allAvailableSignerTokens$)
  const theme = localStorage.getItem('theme')

  return (
    <SigningOrChildren>
      {!availableTokens && <Loading/>}
      {!!signer && !!network && !!availableTokens && !!availableTokens.length &&
      <div className={theme === 'dark' ? 'theme-dark' : ''}>
        <Components.SwapComponent account={signer} network={network} tokens={availableTokens} buyToken={NO_TKN} sellToken={REEF}
                                  ></Components.SwapComponent></div>}
    </SigningOrChildren>
  )
}
