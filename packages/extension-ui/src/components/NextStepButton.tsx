// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../types'

import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import styled from 'styled-components'

import { CTA } from './../../../reef/extension-ui/uik'

type Props = React.ComponentProps<typeof CTA>;

function NextStepButton ({ children, ...props }: Props): React.ReactElement<Props> {
  return (
    <CTA
      {...props}
      className='next-step-btn'
    >
      {children}
      <FontAwesomeIcon
        className='arrowRight'
        icon={faArrowRight}
        size='sm'
      />
    </CTA>
  )
}

export default styled(NextStepButton)(({ theme }: ThemeProps) => `
  .arrowRight{
    float: right;
    margin-top: 4px;
    margin-right: 1px;
    color: ${theme.buttonTextColor};
  }
`)
