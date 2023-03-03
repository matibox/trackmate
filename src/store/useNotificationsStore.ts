import { create } from 'zustand';

type NotificationStore = {
  isOpened: boolean;
  toggle: () => void;
  unread: boolean;
  setUnread: (value: boolean) => void;
};

export const useNotificationStore = create<NotificationStore>()(set => ({
  isOpened: false,
  toggle: () => set(state => ({ isOpened: !state.isOpened })),
  unread: false,
  setUnread: value => set(() => ({ unread: value })),
}));
