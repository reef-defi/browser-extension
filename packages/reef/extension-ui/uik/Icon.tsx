import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

export const Icon = ({ className, icon }: Icon): JSX.Element => (
  <FontAwesomeIcon
    className={`uik-icon ${className}`}
    icon={icon}
  />
);
