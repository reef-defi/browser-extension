import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

interface Icon { className?: string; icon?: string;}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Icon = ({ className, icon }: Icon): JSX.Element => (
  <FontAwesomeIcon
    className={`uik-icon ${className || ''}`}
    icon={icon as IconProp}
  />
);
