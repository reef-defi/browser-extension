import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

interface Icon { className?: any; icon?: any;}

export const Icon = ({ className, icon }: Icon): JSX.Element => (
  <FontAwesomeIcon
    className={`uik-icon ${className || ''}`}
    icon={icon}
  />
);
