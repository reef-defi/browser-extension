import React from 'react';

interface Card {
  children?: any; className?: string; head?: any; largePadding?: any;
}

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
