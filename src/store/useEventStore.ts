import { create } from 'zustand';

type EventStore = {
  isOpened: boolean;
  open: (
    eventId: string,
    championshipName: string | undefined,
    eventName: string | undefined
  ) => void;
  close: () => void;
  championshipName: string | undefined;
  eventName: string | undefined;
  eventId: string | undefined;
};

export const useEventStore = create<EventStore>()(set => ({
  isOpened: false,
  open: (eventId, championshipName, eventName) =>
    set(() => ({ isOpened: true, eventId, championshipName, eventName })),
  close: () =>
    set(() => ({
      isOpened: false,
      championshipName: undefined,
      eventName: undefined,
      eventId: undefined,
    })),
  championshipName: undefined,
  eventName: undefined,
  eventId: undefined,
}));
