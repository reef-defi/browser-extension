import { faCheckCircle, faExclamationTriangle, faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useRef, useState } from 'react';

import Icon from './Icon';

const getIcon = (type: string) => {
  const map = { success: faCheckCircle, danger: faExclamationTriangle };

  return map[type] || faInfoCircle;
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

  let hovered = false;
  let delayed = false;

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
        buttons[i].addEventListener('click', close);
      }
    }

    if (onClose && aliveFor) {
      const timer = setTimeout(() => {
        if (hovered) {
          delayed = true;
        } else {
          close();
        }
      }, 1000 * aliveFor);

      return () => clearTimeout(timer);
    }

    return () => {};
  }, []);

  return (
    <div
      className={`
        uik-alert
        uik-alert--${type}
        ${closing ? 'uik-alert--close' : ''}
        ${!!onClose && !!aliveFor ? 'uik-alert--autoclose' : ''}
        ${className || ''}
      `}
      onMouseEnter={() => { hovered = true; }}
      onMouseLeave={() => {
        hovered = false;
        if (delayed) close();
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
                onClick={close}
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
