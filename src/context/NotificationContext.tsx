import {
  type ReactNode,
  type FC,
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from 'react';

type NotificationContext = {
  sendNotification: (title: string, options?: NotificationOptions) => void;
};

const NotificationContext = createContext<NotificationContext | null>(null);

export const useNotificationCtx = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('Not in context provider');
  return ctx;
};

const NotificationContextProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [canSend, setCanSend] = useState(false);

  useEffect(() => {
    void Notification.requestPermission().then(perm => {
      if (perm === 'granted') {
        setCanSend(true);
      } else {
        setCanSend(false);
      }
    });
  }, []);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!canSend) return;
      const notification = new Notification(title, {
        icon: '/Full.png',
        ...options,
      });
      return notification;
    },
    [canSend]
  );

  return (
    <NotificationContext.Provider
      value={{
        sendNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContextProvider;
