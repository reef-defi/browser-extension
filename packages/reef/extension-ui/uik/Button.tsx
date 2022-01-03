import React from 'react';

import { FishAnimation } from './FishAnimation';
import { UikLoading } from './Loading';

export const UikButton = ({ children,
  danger,
  fill,
  iconOnly,
  loader,
  loading,
  onClick,
  size,
  success,
  text }: UikButton): JSX.Element => (
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
    {loading ? (loader === 'fish' ? <FishAnimation /> : <UikLoading />) : ''}
    <span className='uik-button__text'>{children}{text}</span>
  </button>
);
