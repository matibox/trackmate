import dayjs from 'dayjs';
import { type FC } from 'react';
import cn from '~/lib/classes';
import { type RouterOutputs } from '~/utils/api';

type NotifGroup = RouterOutputs['notification']['getAll']['notifGroups'];

type NotificationProps = {
  type: keyof NotifGroup;
  notification: NotifGroup[NotificationProps['type']][number];
};

const Notification: FC<NotificationProps> = ({ type, notification }) => {
  const handleAction = () => {
    switch (type) {
      case 'feedbackRequestNotification': {
        // TODO: open post feedback
      }
    }
  };

  return (
    <div className='relative flex flex-col p-2 pl-3'>
      <div
        className={cn(
          'absolute bottom-4 left-0.5 hidden h-1 w-1 rounded-full bg-sky-500',
          {
            block: !notification.read,
          }
        )}
        onClick={handleAction}
      />
      <span className='text-sm text-slate-300'>
        {dayjs(notification.createdAt).calendar(dayjs())}
      </span>
      <p>{notification.message}</p>
    </div>
    // TODO: on click take the proper action
  );
};

export default Notification;
