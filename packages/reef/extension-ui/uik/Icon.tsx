import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

export const Icon = ({ icon }: Icon): JSX.Element => (
  <FontAwesomeIcon
    className='uik-icon'
    icon={icon}
  />
);
