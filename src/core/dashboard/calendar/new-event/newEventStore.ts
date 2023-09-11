import { create } from 'zustand';
import { type eventTypes } from '~/lib/constants';

type EventType = (typeof eventTypes)[number];

type NewEventStore = {
  eventType: EventType | null;
  setEventType: (eventType: EventType | null) => void;
};

export const useNewEvent = create<NewEventStore>()(set => ({
  eventType: null,
  setEventType: eventType => set(() => ({ eventType })),
}));
