import dayjs from 'dayjs';
import { type FC } from 'react';
import cn from '../lib/classes';
import { type RouterOutputs } from '../utils/api';

type NotifGroup = RouterOutputs['notification']['getAll']['notifGroups'];

type NotificationProps = {
  type: keyof NotifGroup;
  notification: NotifGroup[NotificationProps['type']][number];
};

const Notification: FC<NotificationProps> = ({ type, notification }) => {
  return (
    <div className='relative flex flex-col p-2 pl-3'>
      <div
        className={cn(
          'none absolute bottom-4 left-0.5 h-1 w-1 rounded-full bg-sky-500',
          {
            block: !notification.read,
          }
        )}
      />
      <span className='text-sm text-slate-300'>
        {dayjs().calendar(dayjs(notification.createdAt))}
      </span>
      <p>{notification.message}</p>
    </div>
    // TODO: mark all as read
    // TODO: on click take the proper action
  );
};

export default Notification;
