import React from 'react';

import { FishAnimation, Loading } from './index';

export const Button = ({ children,
  danger,
  fill,
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
    `}
    onClick={onClick}
    type='button'
  >
    {loading ? (loader === 'fish' ? <FishAnimation /> : <Loading />) : ''}
    <span className='uik-button__text'>{children}{text}</span>
  </button>
);
