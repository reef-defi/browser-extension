import {Components, ReefSigner, utils} from "@reef-defi/react-lib";
import {BigNumber, ethers} from "ethers";
import {useEffect, useState} from "react";
import {TxStatusHandler, TxStatusUpdate} from "@reef-defi/react-lib/dist/utils";
import {useObservableState} from "../hooks/useObservableState";
import {provider$} from "../state/providerState";
import {Provider} from "@reef-defi/evm-provider";

export enum EvmBindComponentTxType {
  TRANSFER = 'TRANSFER',
  BIND = 'BIND',
}

interface EvmBindComponent {
  bindSigner: ReefSigner;
  signers: ReefSigner[];
  onTxUpdate?: TxStatusHandler;
}

// need to call onTxUpdate even if component is destroyed
const getUpdateTxCallback = (fns: TxStatusHandler[]): TxStatusHandler => (val) => {
  fns.forEach((fn) => fn ? fn(val) : null);
};

const MIN_BALANCE = ethers.utils.parseEther('6');

function getSignersWithEnoughBalance(signers: ReefSigner[], bindFor: ReefSigner) {
  return signers?.length ? signers.filter(sig => sig.address !== bindFor.address && sig.balance.gt(MIN_BALANCE.mul(BigNumber.from('2')))) : [];
}

export const EvmBindComponent = ({bindSigner, signers, onTxUpdate}: EvmBindComponent): JSX.Element => {
  const provider = useObservableState(provider$)
  const [bindFor, setBindFor] = useState(bindSigner);
  const [availableTxAccounts, setAvailableTxAccounts] = useState<ReefSigner[]>([]);
  const [transferBalanceFrom, setTransferBalanceFrom] = useState<ReefSigner>();
  const [txStatus, setTxStatus] = useState<TxStatusUpdate | undefined>();

  useEffect(() => {
    setBindFor(bindSigner);
  }, [bindSigner]);

  useEffect(() => {
    setTransferBalanceFrom(availableTxAccounts[0]);
  }, [availableTxAccounts]);

  useEffect(() => {
    const fromSigners = getSignersWithEnoughBalance(signers, bindFor);
    setAvailableTxAccounts(fromSigners);
  }, [signers, bindFor]);

  const hasBalanceForBinding = (balance: BigNumber) => {
    return balance.gte(MIN_BALANCE);
  };

  const transfer = async (from: ReefSigner, to: ReefSigner, amount: BigNumber, onTxUpd: TxStatusHandler) => {
    if (!provider) {
      return;
    }
    const txIdent = await utils.sendToNativeAddress(provider, from, MIN_BALANCE, to.address, (val: TxStatusUpdate) => {
      if (val.error || val.isInBlock) {
        console.log("TRANSFER OK from=",from.address, ' to=',to.address);
        onTxUpd({...val, componentTxType: EvmBindComponentTxType.TRANSFER, addresses: [from.address, to.address]});
      }
      if(val.isInBlock){
        bindAccount(getUpdateTxCallback([onTxUpdate as TxStatusHandler, setTxStatus]));
      }
    });
    onTxUpd({txIdent, componentTxType: EvmBindComponentTxType.TRANSFER, addresses: [from.address, to.address]})
  }

  const onAccountSelect = (_: any, selected: ReefSigner): void => setTransferBalanceFrom(selected);

  const bindAccount = (onTxUpdate: TxStatusHandler) => {
    const txIdent = utils.bindEvmAddress(bindFor, provider as Provider, (val: TxStatusUpdate) => {
      console.log("bind cb=", val);
      if (val.error || val.isInBlock) {
        onTxUpdate({...val, componentTxType: EvmBindComponentTxType.BIND, addresses: [bindFor.address]})
      }
    }, true);
    if (txIdent) {
      onTxUpdate({txIdent, componentTxType: EvmBindComponentTxType.BIND, addresses: [bindFor.address]});
    }
  };

  return (
    <div className="mx-auto">
      <Components.Display.ComponentCenter>
        <Components.Card.Card>
          <Components.Card.CardHeader>
            <Components.Card.CardHeaderBlank/>
            <Components.Card.CardTitle title="Register Ethereum VM Address"/>
            <Components.Card.CardHeaderBlank/>
          </Components.Card.CardHeader>
          <Components.Card.SubCard>
            <p>Creating Ethereum VM address for {bindFor.name}
              <Components.Text.MiniText>({utils.toAddressShortDisplay(bindFor.address)})</Components.Text.MiniText></p>
            {bindFor.isEvmClaimed &&
            <Components.Display.FlexRow>
              <p>Account {bindFor.name}
                <Components.Text.MiniText>({utils.toAddressShortDisplay(bindFor.address)})</Components.Text.MiniText> already
                has Ethereum VM address<br/>
                {bindFor.evmAddress}
              </p>
            </Components.Display.FlexRow>}
            {!bindFor.isEvmClaimed &&
            <div>
              {txStatus && (<>
                {!txStatus.error && !txStatus.isInBlock && !txStatus.isComplete &&
                <p>{txStatus.componentTxType === EvmBindComponentTxType.BIND ? 'Binding' : 'Transfer'} in progress</p>
                }
                {!txStatus.error && txStatus.isInBlock && txStatus.componentTxType === EvmBindComponentTxType.TRANSFER && (<>
                  <p>Transfer complete. Now execute bind transaction.</p>
                  <button
                    onClick={() => bindAccount(getUpdateTxCallback([onTxUpdate as TxStatusHandler, setTxStatus]))}>Continue
                    and bind
                  </button>
                </>)}
                {!txStatus.error && txStatus.isInBlock && txStatus.componentTxType === EvmBindComponentTxType.BIND && (<>
                  <p>Binding complete Ethereum VM address is {bindFor.evmAddress}</p>
                </>)}
                {txStatus.error && <p>{txStatus.error.message}</p>}
              </>)}

              {!txStatus && !hasBalanceForBinding(bindFor.balance) &&
              <div>
                {!txStatus && !transferBalanceFrom &&
                <p>Please add some Reef to this address for Ethereum VM binding transaction fee.</p>}
                {!txStatus && !!transferBalanceFrom && <Components.Display.FlexRow>
                  <p>First send {utils.toReefBalanceDisplay(MIN_BALANCE)} for
                    transaction<br/> from {transferBalanceFrom.name}
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
                  <button
                    onClick={() => transfer(transferBalanceFrom, bindSigner, MIN_BALANCE, getUpdateTxCallback([onTxUpdate as TxStatusHandler, setTxStatus]))}>Continue
                  </button>
                </Components.Display.FlexRow>
                }
              </div>
              }

              {(!txStatus) && hasBalanceForBinding(bindFor.balance) &&
              <Components.Display.FlexRow>
                <p>Account is ready to create Ethereum VM address.</p>
                <button
                  onClick={() => bindAccount(getUpdateTxCallback([onTxUpdate as TxStatusHandler, setTxStatus]))}>Continue
                </button>
              </Components.Display.FlexRow>
              }

            </div>}

          </Components.Card.SubCard>
        </Components.Card.Card>
      </Components.Display.ComponentCenter>
    </div>
  )
}
