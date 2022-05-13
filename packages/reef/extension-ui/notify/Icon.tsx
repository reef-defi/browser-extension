import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

export interface Props {
  icon?: any,
  className?: string
}

const Icon = ({ className,
  icon }: Props): JSX.Element => (
  <FontAwesomeIcon
    className={`uik-icon ${className || ''}`}
    icon={icon}
  />
);

export default Icon;
