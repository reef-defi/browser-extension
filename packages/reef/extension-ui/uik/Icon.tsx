import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

export interface Props {
  icon?: any,
  className?: string
}

export const Icon = ({ className,
  icon }: Props): JSX.Element => (
  <FontAwesomeIcon
    className={`uik-icon ${className || ''}`}
    icon={icon as IconProp}
  />
);
