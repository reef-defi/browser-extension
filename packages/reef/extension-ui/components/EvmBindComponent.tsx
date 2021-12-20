import {Components, ReefSigner, utils} from "@reef-defi/react-lib";
import {BigNumber, ethers} from "ethers";
import {useEffect, useState} from "react";
import {TxStatusUpdate} from "@reef-defi/react-lib/dist/utils";
import {useObservableState} from "../hooks/useObservableState";
import {provider$} from "../state/providerState";
import {onTxUpdateReloadSignerBalances} from "../state/util";
import {Provider} from "@reef-defi/evm-provider";

interface EvmBindComponent {
  signer: ReefSigner;
  signers: ReefSigner[];
}

const MIN_BALANCE = ethers.utils.parseEther('3');

export const EvmBindComponent = ({signer, signers}: EvmBindComponent): JSX.Element => {
  const provider = useObservableState(provider$)
  const [bindFor, setBindFor] = useState(signer);
  const [transferBalanceFrom, setTransferBalanceFrom] = useState(signers[0]);
  const [availableTxAccounts, setAvailableTxAccounts] = useState<ReefSigner[]>([]);
  const [txStatus, setTxStatus] = useState<TxStatusUpdate | undefined>();

  useEffect(() => {
    setBindFor(signer);
  }, [signer]);

  useEffect(() => {
    const fromSigners = signers?.length ? signers.filter(sig => sig.address !== bindFor.address && sig.balance.gt(MIN_BALANCE)) : [];
    setAvailableTxAccounts(fromSigners);
  }, [signers, bindFor]);

  const hasBalanceForBinding = (balance: BigNumber) => {
    return balance.gte(MIN_BALANCE);
  };

  const transfer = async (from: ReefSigner, to: ReefSigner, amount: BigNumber) => {
    if (!provider) {
      return;
    }
    console.log("to.address=", to.address);
    const txIdent = await utils.sendToNativeAddress(provider, from, MIN_BALANCE, to.address, (val: TxStatusUpdate) => {
      console.log('TXXXX bind=', val, to.address);
      onTxUpdateReloadSignerBalances(val);
      setTxStatus(val);
    });
    setTxStatus({txIdent})
  }

  const onAccountSelect = (_: any, selected: ReefSigner): void => {
    const selectAcc = async (): Promise<void> => {
      setTransferBalanceFrom(selected);
    };
    selectAcc();
  };


  const onBindTx=(val:TxStatusUpdate)=> {
    console.log("bind=",val);...display view
  }

  return (
    <div className="mx-auto">
      <Components.Display.ComponentCenter>
        <Components.Card.Card>
          <Components.Card.CardHeader>
            <Components.Card.CardHeaderBlank/>
            <Components.Card.CardTitle title="Bind Ethereum VM Address"/>
            <Components.Card.CardHeaderBlank/>
          </Components.Card.CardHeader>
          <Components.Card.SubCard>
            {bindFor.isEvmClaimed &&
            <Components.Display.FlexRow>
              <p>This account already has Ethereum VM:<br/>
                {bindFor.evmAddress}
              </p>
            </Components.Display.FlexRow>}
            {!bindFor.isEvmClaimed &&
            <div>
              {!hasBalanceForBinding(bindFor.balance) &&
              <div>
                {txStatus && <p>Transaction in progress</p>}
                {!txStatus && <Components.Display.FlexRow>
                  <p>REEF is needed for binding transaction. <br/>
                    Add {utils.toReefBalanceDisplay(MIN_BALANCE)} from {transferBalanceFrom.name}
                    <Components.Modal.OpenModalButton
                      id="selectMyAddress"
                      className="btn-empty link-text text-xs text-primary pl-1rem">
                      (change)
                    </Components.Modal.OpenModalButton>
                    <Components.AccountListModal
                      id="selectMyAddress"
                      accounts={availableTxAccounts}
                      selectAccount={onAccountSelect}
                      title={(
                        <div>
                          Select account
                        </div>
                      )}
                    />
                  </p>
                  <button onClick={() => transfer(transferBalanceFrom, signer, MIN_BALANCE)}>Continue</button>
                </Components.Display.FlexRow>
                }
              </div>
              }

              {hasBalanceForBinding(bindFor.balance) &&
              <Components.Display.FlexRow>
                <p>Continue to bind.</p>
                <button onClick={()=>utils.alertEvmAddressBind(bindFor, provider as Provider, onBindTx)}>Continue</button>
              </Components.Display.FlexRow>
              }

            </div>}

          </Components.Card.SubCard>
        </Components.Card.Card>
      </Components.Display.ComponentCenter>
    </div>
  )
}
