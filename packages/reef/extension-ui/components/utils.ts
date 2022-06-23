import { toast } from 'react-toastify';

export interface UrlAddressParams {
  address1: string;
  address2: string;
}

export const SPECIFIED_SWAP_URL = '/swap/:address1/:address2';

export const addressReplacer = (url: string, address1: string, address2: string): string => url
  .replace(':address1', address1)
  .replace(':address2', address2);

export declare type Notify = 'success' | 'error' | 'warning' | 'info';

export const notify = (message: string, type: Notify = 'success'): void => {
  toast[type](message);
};

