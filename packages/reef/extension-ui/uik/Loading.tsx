import React from 'react';

interface Loading{
  className?: string;
  color?: 'white'|'black';
  size?: 'small'|string;
  text?: string;
}
export const Loading = ({ className, color, size, text }: Loading): JSX.Element => (
  <div className={`
      uik-loading
      ${color === 'white' ? 'uik-loading--white' : ''}
      ${color === 'black' ? 'uik-loading--black' : ''}
      ${size === 'small' ? 'uik-loading--small' : ''}
      ${className || ''}
      `}
  >
    <div className='uik-loading__spinner'>
      <div className='uik-loading__spinner-dot'></div>
      <div className='uik-loading__spinner-dot'></div>
      <div className='uik-loading__spinner-dot'></div>
      <div className='uik-loading__spinner-dot'></div>
      <div className='uik-loading__spinner-dot'></div>
      <div className='uik-loading__spinner-dot'></div>
    </div>

    { text ? <div className='uik-loading__text'>{text}</div> : '' }
  </div>
);
