import React from 'react';
import ReactDOM from 'react-dom';

import Notifications, { Notification } from './Notifications';

export interface NewNotification {
  message: string,
  aliveFor?: number,
  keepAlive?: boolean,
  children?: any
}

const notifications: Notification[] = [];

const getContainer = (): HTMLElement => {
  const containerId = 'uik-notifications-container';

  let el = document.getElementById(containerId);

  if (el) return el;

  el = document.createElement('div');
  el.id = containerId;
  document.body.appendChild(el);

  return el;
};

const generateId = (): number => {
  let id = Math.floor(Math.random() * 1000000);

  const isUnique = ((): boolean => {
    return !notifications.find((item) => item.id === id);
  })();

  if (!isUnique) id = generateId();

  return id;
};

const add = ({ params,
  type }: {
  type: string,
  params?: NewNotification | string
}) => {
  const id = generateId();

  if (typeof params === 'string') {
    params = { message: params };
  }

  notifications.push({ id, type, ...params });
  render();
};

const remove = (id: number) => {
  setTimeout(() => {
    const notification = notifications.find((notification) => notification.id === id);

    if (notification) {
      const index = notifications.indexOf(notification);

      notifications.splice(index, 1);
      render();
    }
  }, 0.25 * 1000);
};

const render = () => {
  const container: HTMLElement = getContainer();

  if (!notifications.length) {
    container.remove();

    return;
  }

  ReactDOM.render(
    <Notifications
      notifications={notifications}
      onClose={remove}
    />,
    container
  );
};

const info = (params: NewNotification | string) => { add({ params, type: 'info' }); };

const success = (params: NewNotification | string) => { add({ params, type: 'success' }); };

const danger = (params: NewNotification | string) => { add({ params, type: 'danger' }); };

const notify = { danger, info, success };

export default notify;
