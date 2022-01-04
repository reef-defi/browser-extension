import React from 'react';

export const UikText = ({ children, className, text, type }: UikText): JSX.Element => (
  <div className={`
      uik-text
      ${type === 'headline' ? 'uik-text--headline' : ''}
      ${type === 'title' ? 'uik-text--title' : ''}
      ${type === 'light' ? 'uik-text--light' : ''}
      ${type === 'lead' ? 'uik-text--lead' : ''}
      ${type === 'mini' ? 'uik-text--mini' : ''}
      ${className || ''}
    `}
  >{children}{text}</div>
);
