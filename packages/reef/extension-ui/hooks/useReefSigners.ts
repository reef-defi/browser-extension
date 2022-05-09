import { ReefSigner } from '@reef-defi/react-lib'
import { useEffect, useState } from 'react'
import { AccountJson } from '@reef-defi/extension-base/background/types'
import { toReefSigner } from '../state/util'
import Signer from '@reef-defi/extension-base/page/Signer'
import { sendMessage } from '@reef-defi/extension-ui/messaging'
import { Provider } from '@reef-defi/evm-provider'

const injectionSigner = new Signer(sendMessage)

export const useReefSigners = (accounts: AccountJson[] | null, provider: Provider|undefined): ReefSigner[] => {
  const [signers, setSigners] = useState<ReefSigner[]>([])

  useEffect((): void => {
    const initAsync = async (): Promise<void> => {
      if (!accounts || !accounts?.length || !provider) {
        setSigners([])
        return
      }
      const sgnrs: any[] = await Promise.all<ReefSigner|undefined>(accounts?.map((acc: AccountJson) => toReefSigner(acc, provider, injectionSigner)))

      setSigners(sgnrs.filter(s => !!s))
    }
    initAsync()
  }, [accounts, provider])
  return signers
}
