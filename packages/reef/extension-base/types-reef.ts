import {
  AccountJson,
} from "@reef-defi/extension-base/background/types";

export interface RequestAccountSelect {
  address: string;
}
export interface RequestSignaturesReef {
  'pri(accounts.select)': [RequestAccountSelect, boolean];
  'pri(accounts.selected)': [null, boolean, AccountJson|null];
}
