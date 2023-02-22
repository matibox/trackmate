import { create } from 'zustand';

type NotificationStore = {
  isOpened: boolean;
  toggle: () => void;
};

export const useNotificationStore = create<NotificationStore>()(set => ({
  isOpened: false,
  toggle: () => set(state => ({ isOpened: !state.isOpened })),
}));
