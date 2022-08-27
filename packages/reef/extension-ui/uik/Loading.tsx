import React from 'react';

export interface Props {
  color?: 'white' | 'black',
  size?: 'small',
  text?: string,
  className?: string
}

export const Loading = ({ className,
  color,
  size,
  text }: Props): JSX.Element => (
  <div
    className={`
      uik-loading
      ${color === 'white' ? 'uik-loading--white' : ''}
      ${color === 'black' ? 'uik-loading--black' : ''}
      ${size === 'small' ? 'uik-loading--small' : ''}
      ${className || ''}
    `}
  >
    <div className='uik-loading__spinner'>
      <div className='uik-loading__spinner-dot' />
      <div className='uik-loading__spinner-dot' />
      <div className='uik-loading__spinner-dot' />
      <div className='uik-loading__spinner-dot' />
      <div className='uik-loading__spinner-dot' />
      <div className='uik-loading__spinner-dot' />
    </div>

    { !!text && <div className='uik-loading__text'>{text}</div> }
  </div>
);
