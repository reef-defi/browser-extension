// Copyright 2019-2021 @polkadot/extension-inject authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeypairType } from '@reef-defi/util-crypto/types';
import type { Signer as InjectedSigner } from '@polkadot/api/types';
import type { ProviderInterface } from '@polkadot/rpc-provider/types';
import type { ExtDef } from '@polkadot/types/extrinsic/signedExtensions/types';

import { Provider } from '@reef-defi/evm-provider';
import { Signer as ReefEVMSigner } from '@reef-defi/evm-provider/Signer';

// eslint-disable-next-line no-undef
type This = typeof globalThis;

export type Unsubcall = () => void;

export interface InjectedAccount {
  address: string;
  genesisHash?: string | null;
  name?: string;
  type?: KeypairType;
  // REEF update
  isSelected?: boolean;
}

export interface InjectedAccountWithMeta {
  address: string;
  meta: {
    genesisHash?: string | null;
    name?: string;
    source: string;
  };
  type?: KeypairType;
}

export interface InjectedAccounts {
  get: (anyType?: boolean) => Promise<InjectedAccount[]>;
  subscribe: (cb: (accounts: InjectedAccount[]) => void | Promise<void>) => Unsubcall;
}

export interface InjectedExtensionInfo {
  name: string;
  version: string;
}

// Metadata about a provider
export interface ProviderMeta {
  // Network of the provider
  network: string;
  // Light or full node
  node: 'full' | 'light';
  // The extension source
  source: string;
  // Provider transport: 'WsProvider' etc.
  transport: string;
}

export interface MetadataDefBase {
  chain: string;
  genesisHash: string;
  icon: string;
  ss58Format: number;
  chainType?: 'substrate' | 'ethereum'
}

export interface MetadataDef extends MetadataDefBase {
  color?: string;
  specVersion: number;
  tokenDecimals: number;
  tokenSymbol: string;
  types: Record<string, Record<string, string> | string>;
  metaCalls?: string;
  userExtensions?: ExtDef;
}

export interface InjectedMetadataKnown {
  genesisHash: string;
  specVersion: number;
}

export interface InjectedMetadata {
  get: () => Promise<InjectedMetadataKnown[]>;
  provide: (definition: MetadataDef) => Promise<boolean>;
}

export type ProviderList = Record<string, ProviderMeta>

export interface InjectedProvider extends ProviderInterface {
  listProviders: () => Promise<ProviderList>;
  startProvider: (key: string) => Promise<ProviderMeta>;
}

export interface InjectedProviderWithMeta {
  // provider will actually always be a PostMessageProvider, which implements InjectedProvider
  provider: InjectedProvider;
  meta: ProviderMeta;
}

export interface Injected {
  accounts: InjectedAccounts;
  metadata?: InjectedMetadata;
  provider?: InjectedProvider;
  signer: InjectedSigner;
}

export interface ReefInjected extends Injected{
  reefSigner: ReefInjectedSigner;
  reefProvider: ReefInjectedProvider;
}

export interface ReefInjectedSigner {
  subscribeSelectedAccount: (cb: (accounts: InjectedAccount | undefined) => unknown) => Unsubcall;
  subscribeSelectedAccountSigner: (cb: (reefEVMSigner: ReefEVMSigner | undefined) => unknown) => Unsubcall;
}

export interface ReefInjectedProvider {
  subscribeSelectedNetwork: (cb: (rpcUrl: string) => void) => void;
  subscribeSelectedNetworkProvider: (cb: (provider: Provider) => void) => Unsubcall;
}

export interface InjectedWindowProvider {
  enable: (origin: string) => Promise<Injected>;
  version: string;
}

export interface InjectedWindow extends This {
  injectedWeb3: Record<string, InjectedWindowProvider>;
}

export type InjectedExtension = InjectedExtensionInfo & ReefInjected;

export type InjectOptions = InjectedExtensionInfo;

export interface Web3AccountsOptions {
  ss58Format?: number,
  accountType?: KeypairType[]
}
