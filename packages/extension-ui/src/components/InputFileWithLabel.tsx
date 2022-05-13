// Copyright 2017-2021 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../types';

import { formatNumber, hexToU8a, isHex, u8aToString } from '@reef-defi/util';
import React, { createRef, useCallback, useState } from 'react';
import Dropzone, { DropzoneRef } from 'react-dropzone';
import styled from 'styled-components';

import useTranslation from '../hooks/useTranslation';
import Label from './Label';

function classes (...classNames: (boolean | null | string | undefined)[]): string {
  return classNames
    .filter((className): boolean => !!className)
    .join(' ');
}

export interface InputFileProps {
  // Reference Example Usage: https://github.com/react-dropzone/react-dropzone/tree/master/examples/Accept
  // i.e. MIME types: 'application/json, text/plain', or '.json, .txt'
  className?: string;
  accept?: string;
  clearContent?: boolean;
  convertHex?: boolean;
  help?: React.ReactNode;
  isDisabled?: boolean;
  isError?: boolean;
  label: string;
  onChange?: (contents: Uint8Array, name: string) => void;
  placeholder?: React.ReactNode | null;
  withEllipsis?: boolean;
  withLabel?: boolean;
}

interface FileState {
  name: string;
  size: number;
}

const BYTE_STR_0 = '0'.charCodeAt(0);
const BYTE_STR_X = 'x'.charCodeAt(0);
const NOOP = (): void => undefined;

function convertResult (result: ArrayBuffer, convertHex?: boolean): Uint8Array {
  const data = new Uint8Array(result);

  // this converts the input (if detected as hex), vai the hex conversion route
  if (convertHex && data[0] === BYTE_STR_0 && data[1] === BYTE_STR_X) {
    const hex = u8aToString(data);

    if (isHex(hex)) {
      return hexToU8a(hex);
    }
  }

  return data;
}

function InputFile ({ accept, className = '', clearContent, convertHex, isDisabled, isError = false, label, onChange, placeholder }: InputFileProps): React.ReactElement<InputFileProps> {
  const { t } = useTranslation();
  const dropRef = createRef<DropzoneRef>();
  const [file, setFile] = useState<FileState | undefined>();

  const _onDrop = useCallback(
    (files: File[]): void => {
      files.forEach((file): void => {
        const reader = new FileReader();

        reader.onabort = NOOP;
        reader.onerror = NOOP;

        reader.onload = ({ target }: ProgressEvent<FileReader>): void => {
          if (target && target.result) {
            const name = file.name;
            const data = convertResult(target.result as ArrayBuffer, convertHex);

            onChange && onChange(data, name);
            dropRef && setFile({
              name,
              size: data.length
            });
          }
        };

        reader.readAsArrayBuffer(file);
      });
    },
    [convertHex, dropRef, onChange]
  );

  const dropZone = (
    <Dropzone
      accept={accept}
      disabled={isDisabled}
      multiple={false}
      onDrop={_onDrop}
      ref={dropRef}
    >
      {({ getInputProps, getRootProps }): JSX.Element => (
        <div {...getRootProps({ className: classes('ui--InputFile', isError ? 'error' : '', className) })}>
          <input {...getInputProps()} />
          <em className='label'>
            {
              !file || clearContent
                ? placeholder || t('click to select or drag and drop the file here')
                : placeholder || t('{{name}} ({{size}} bytes)', {
                  replace: {
                    name: file.name,
                    size: formatNumber(file.size)
                  }
                })
            }
          </em>
        </div>
      )}
    </Dropzone>
  );

  return label
    ? (
      <Label
        label={label}
      >
        {dropZone}
      </Label>
    )
    : dropZone;
}

export default React.memo(styled(InputFile)(({ isError, theme }: InputFileProps & ThemeProps) => `
  border: 1px solid ${isError ? theme.errorBorderColor : theme.inputBorderColor};
  background: ${theme.inputBackground};
  border-radius: ${theme.borderRadius};
  color: ${isError ? theme.errorBorderColor : theme.textColor};
  font-size: 1rem;
  margin: 0.25rem 0;
  overflow-wrap: anywhere;
  padding: 0.5rem 0.75rem;

  &:hover {
    cursor: pointer;
  }
`));
