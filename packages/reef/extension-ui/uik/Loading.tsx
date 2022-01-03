import React from 'react';

export const UikLoading = ({ color, size, text }: UikLoading): JSX.Element => (
  <div className={`
      uik-loading
      ${color === 'white' ? 'uik-loading--white' : ''}
      ${color === 'black' ? 'uik-loading--black' : ''}
      ${size === 'small' ? 'uik-loading--small' : ''}
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
