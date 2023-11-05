// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Chain } from '@reef-defi/extension-chains/types';
import type { Call, ExtrinsicEra, ExtrinsicPayload } from '@polkadot/types/interfaces';
import type { AnyJson, SignerPayloadJSON } from '@polkadot/types/types';

import { signatureUtils } from '@reef-chain/util-lib';
import { Provider } from '@reef-defi/evm-provider';
import { bnToBn, formatNumber } from '@reef-defi/util';
import BN from 'bn.js';
import { TFunction } from 'i18next';
import React, { useMemo, useRef, useState } from 'react';

import { WsProvider } from '@polkadot/api';

import { Table } from '../../components';
import useMetadata from '../../hooks/useMetadata';
import useTranslation from '../../hooks/useTranslation';

interface Decoded {
  args: AnyJson | null;
  method: Call | null;
}

interface Props {
  className?: string;
  payload: ExtrinsicPayload;
  request: SignerPayloadJSON;
  url: string;
}

function displayDecodeVersion (message: string, chain: Chain, specVersion: BN): string {
  return `${message}: chain=${chain.name}, specVersion=${chain.specVersion.toString()} (request specVersion=${specVersion.toString()})`;
}

function decodeMethod (data: string, chain: Chain, specVersion: BN): Decoded {
  let args: AnyJson | null = null;
  let method: Call | null = null;

  try {
    if (specVersion.eqn(chain.specVersion)) {
      method = chain.registry.createType('Call', data);
      args = (method.toHuman() as { args: AnyJson }).args;
    } else {
      console.log(displayDecodeVersion('Outdated metadata to decode', chain, specVersion));
    }
  } catch (error) {
    console.error(`${displayDecodeVersion('Error decoding method', chain, specVersion)}:: ${(error as Error).message}`);

    args = null;
    method = null;
  }

  return { args, method };
}

function renderMethod (data: string, { args, method }: Decoded, t: TFunction): React.ReactNode {
  if (!args || !method) {
    return (
      <tr>
        <td className='label'>{t<string>('method data')}</td>
        <td className='data'>{data}</td>
      </tr>
    );
  }

  return (
    <>
      <tr>
        <td className='label'>{t<string>('method')}</td>
        <td className='data'>
          <details>
            <summary>{method.section}.{method.method}{
              method.meta
                ? `(${method.meta.args.map(({ name }) => name).join(', ')})`
                : ''
            }</summary>
            <pre>{JSON.stringify(args, null, 2)}</pre>
          </details>
        </td>
      </tr>
      {method.meta && (
        <tr>
          <td className='label'>{t<string>('info')}</td>
          <td className='data'>
            <details>
              <summary>{method.meta.docs.map((d) => d.toString().trim()).join(' ')}</summary>
            </details>
          </td>
        </tr>
      )}
    </>
  );
}

function mortalityAsString (era: ExtrinsicEra, hexBlockNumber: string, t: TFunction): string {
  if (era.isImmortalEra) {
    return t<string>('immortal');
  }

  const blockNumber = bnToBn(hexBlockNumber);
  const mortal = era.asMortalEra;

  return t<string>('mortal, valid from {{birth}} to {{death}}', {
    replace: {
      birth: formatNumber(mortal.birth(blockNumber)),
      death: formatNumber(mortal.death(blockNumber))
    }
  });
}

async function getDecodedMethodDataAnu (data: string) {
  const provider = new Provider({
    provider: new WsProvider('wss://rpc.reefscan.info/ws')
  });
  const res = await signatureUtils.decodePayloadMethod(provider, data, []);

  return res;
}

function Extrinsic ({ className, payload: { era, nonce, tip }, request: { blockNumber, genesisHash, method, specVersion: hexSpec }, url }: Props): React.ReactElement<Props> {
  const [resolvedMethodName, setResolvedMethodName] = useState<any[]>([]);
  const [methodCalled, setMethodCalled] = useState<string>('');
  const [resolvedMethodParams, setResolvedMethodParams] = useState<any[]>([]);
  const { t } = useTranslation();
  const chain = useMetadata(genesisHash);
  const specVersion = useRef(bnToBn(hexSpec)).current;
  const decoded = useMemo(
    () => chain && chain.hasMetadata
      ? decodeMethod(method, chain, specVersion)
      : { args: null, method: null },
    [method, chain, specVersion]
  );

  const resolvedDataPromise = getDecodedMethodDataAnu(method);

  resolvedDataPromise.then((rsd) => {
    setMethodCalled(rsd.methodName);
    const allMethodNames = rsd.methodName.split('(')[1].split(',');

    allMethodNames[allMethodNames.length - 1] = allMethodNames[allMethodNames.length - 1].slice(0, -1);
    const newArray = rsd.args.map((element: any) => {
      if (typeof element === 'object' && !Array.isArray(element)) {
        const values = Object.values(element);

        return values.length > 0 ? values[0] : null;
      }

      return element;
    });

    setResolvedMethodName(allMethodNames);
    setResolvedMethodParams(newArray);
  }).catch((err) => console.log(err));

  return (
    <Table
      className={`${className || ''} extrinsic-table`}
      isFull
    >
      <tr>
        <td className='label'>{t<string>('from')}</td>
        <td className='data'>{url}</td>
      </tr>
      <tr>
        <td className='label'>{chain ? t<string>('chain') : t<string>('genesis')}</td>
        <td className='data'>{chain ? chain.name : genesisHash}</td>
      </tr>
      <tr>
        <td className='label'>{t<string>('version')}</td>
        <td className='data'>{specVersion.toNumber()}</td>
      </tr>
      <tr>
        <td className='label'>{t<string>('nonce')}</td>
        <td className='data'>{formatNumber(nonce)}</td>
      </tr>
      {!tip.isEmpty && (
        <tr>
          <td className='label'>{t<string>('tip')}</td>
          <td className='data'>{formatNumber(tip)}</td>
        </tr>
      )}
      {renderMethod(method, decoded, t)}
      <tr>
        <td className='label'>{t<string>('lifetime')}</td>
        <td className='data'>{mortalityAsString(era, blockNumber, t)}</td>
      </tr>
      {methodCalled !== ''
        ? <>
          <tr>
            <td className='label'>method called</td>
            <td className='data'>{methodCalled}</td>
          </tr>
        </>
        : <></>}
      {resolvedMethodName.map((name, index) => (
        <tr key={index}>
          <td className='label'>{name}</td>
          <td className='data'>{resolvedMethodParams[index]}</td>
        </tr>
      ))}
    </Table>
  );
}

export default React.memo(Extrinsic);
