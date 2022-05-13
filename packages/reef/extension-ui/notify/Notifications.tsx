import React from 'react';

import Alert from './Alert';

export interface Notification {
  id: number,
  type: string,
  message?: string,
  aliveFor?: number,
  keepAlive?: boolean,
  children?: any
}

export interface Props {
  notifications: Notification[],
  onClose?: (...args: any[]) => any
}

const Notifications = ({ notifications, onClose }: Props): JSX.Element => {
  const closeNotification = (id: number) => {
    if (onClose) {
      onClose(id);
    }
  };

  return (
    <div className='uik-notifications'>
      {
        notifications.map((notification: Notification) => (
          <Alert
            aliveFor={
              notification.keepAlive
                ? undefined
                : notification.aliveFor || 5
            }
            key={notification.id.toString()}
            onClose={() => closeNotification(notification.id)}
            text={notification.message}
            type={notification.type}
          >{notification.children}</Alert>
        ))
      }
    </div>
  );
};

export default Notifications;
