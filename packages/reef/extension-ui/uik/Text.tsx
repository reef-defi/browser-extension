import React from 'react';

export const Text = ({ children, className, text, type }: Text): JSX.Element => (
  <div className={`
      uik-text
      ${type === 'headline' ? 'uik-text--headline' : ''}
      ${type === 'title' ? 'uik-text--title' : ''}
      ${type === 'light' ? 'uik-text--light' : ''}
      ${type === 'lead' ? 'uik-text--lead' : ''}
      ${type === 'mini' ? 'uik-text--mini' : ''}
      ${className}
    `}
  >{children}{text}</div>
);
