import React, { MouseEventHandler } from 'react';

import { FishAnimation } from './index';

interface CTA {
  children?: any[]|string;
  className?: string;
  danger?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: MouseEventHandler;
  size?: 'small';
  text?: string;
}

export const CTA = ({ children,
  className,
  danger,
  disabled,
  loading,
  onClick,
  size,
  text }: CTA): JSX.Element => (
  <button
    className={`
      uik-cta
      ${loading ? 'uik-cta--loading' : ''}
      ${disabled ? 'uik-cta--disabled' : ''}
      ${size === 'small' ? 'uik-cta--small' : ''}
      ${danger ? 'uik-cta--danger' : ''}
      ${className || ''}
    `}
    disabled={disabled}
    onClick={onClick}
    type='button'
  >
    {loading ? <FishAnimation /> : ''}
    <span className='uik-cta__text'>{children}{text}</span>
  </button>
);
