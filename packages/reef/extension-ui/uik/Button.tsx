import React from 'react';

import { FishAnimation, Icon, Loading } from './index';

interface Button {
  children?: any;
  className?: string;
  danger?: any;
  fill?: any;
  icon?: string;
  iconOnly?: any;
  loader?: any;
  loading?: any;
  onClick?: any;
  size?: any;
  success?: any;
  text?: any;
  type: string;
}

export const Button = ({ children,
  className,
  danger,
  fill,
  icon,
  iconOnly,
  loader,
  loading,
  onClick,
  size,
  success,
  text }: Button): JSX.Element => (
  <button
    className={`
      uik-button
      ${fill ? 'uik-button--fill' : ''}
      ${danger ? 'uik-button--danger' : ''}
      ${success ? 'uik-button--success' : ''}
      ${size === 'small' ? 'uik-button--small' : ''}
      ${size === 'large' ? 'uik-button--large' : ''}
      ${loading ? 'uik-button--loading' : ''}
      ${iconOnly ? 'uik-button--icon' : ''}
      ${className || ''}
    `}
    onClick={onClick}
    type='button'
  >
    {loading ? (loader === 'fish' ? <FishAnimation /> : <Loading />) : ''}
    {icon
      ? <Icon
        className='uik-button__icon'
        icon={icon}
      />
      : ''}
    <span className='uik-button__text'>{children}{text}</span>
  </button>
);
