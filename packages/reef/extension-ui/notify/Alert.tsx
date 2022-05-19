import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { faCheckCircle, faExclamationTriangle, faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useRef, useState } from 'react';

import Icon from './Icon';

const getIcon = (type: string): IconDefinition => {
  const map: any = { danger: faExclamationTriangle, success: faCheckCircle };

  const mapItem = map[type];

  return mapItem || faInfoCircle;
};

export interface Props {
  type: string,
  text?: string,
  onClose?: (...args: any[]) => any,
  aliveFor?: number,
  className?: string,
  children?: any
}

const Alert = ({ aliveFor,
  children,
  className,
  onClose,
  text,
  type }: Props): JSX.Element => {
  const [closing, setClosing] = useState(false);

  const hovered = useRef(false);
  const delayed = useRef(false);

  const close = () => {
    if (onClose && !closing) {
      setClosing(true);
      onClose();
    }
  };

  const actions = useRef(null);

  useEffect(() => {
    if (actions.current) {
      // @ts-ignore-next-line
      const buttons = actions.current.children;

      for (let i = 0; i < buttons.length; i++) {
        const button: any = buttons[i];

        button.addEventListener('click', close);
      }
    }

    if (onClose && aliveFor) {
      const timer = setTimeout(() => {
        if (hovered.current) {
          delayed.current = true;
        } else {
          close();
        }
      }, 1000 * aliveFor);

      return () => clearTimeout(timer);
    }

    // @ts-ignore-no-empty-function
    return function () {};
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={`
        uik-alert
        uik-alert--${type}
        ${closing ? 'uik-alert--close' : ''}
        ${!!onClose && !!aliveFor ? 'uik-alert--autoclose' : ''}
        ${className || ''}
      `}
      onMouseEnter={() => { hovered.current = true; }}
      onMouseLeave={() => {
        hovered.current = false;
        if (delayed.current) close();
      }}
      style={
        (
          onClose && aliveFor
            ? { '--alive-for': `${aliveFor}s` }
            : {}
        ) as React.CSSProperties
      }
    >
      <div className='uik-alert__content'>

        <Icon
          className='uik-alert__icon'
          icon={getIcon(type)}
        />

        <div className='uik-alert__text'>{ text }</div>

        {
          !!onClose &&
              <button
                className='uik-alert__close-btn'
                onClick={() => close()}
              >
                <Icon
                  className='uik-alert__close-btn-icon'
                  icon={faTimes}
                />
              </button>
        }
      </div>

      {
        !!children &&
          <div
            className='uik-alert__buttons'
            ref={actions}
          >
            { children }
          </div>
      }
    </div>
  );
};

export default Alert;
