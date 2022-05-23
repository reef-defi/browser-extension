import React from 'react';

interface Card {
  children?: any; className?: string; head?: any; largePadding?: any;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Card = ({ children, className, head, largePadding }: Card): JSX.Element => (
  <div className={`
    uik-card
    ${largePadding ? 'uik-card--large-padding' : ''}
    ${className || ''}
  `}
  >
    {head ? (<div className='uik-card__head'>{head}</div>) : ''}
    <div className='uik-card__content'>{children}</div>
  </div>
);
