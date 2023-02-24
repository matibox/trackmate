import type {
  EditEventErrors,
  EditEventFormState,
} from '@dashboard/events/EditEvent';
import dayjs from 'dayjs';
import { create } from 'zustand';
import type { RouterOutputs } from '../utils/api';
import { defaultEventFormState } from './useNewEventStore';

type Event = RouterOutputs['event']['getDrivingEvents'][number];

type EditEventStore = {
  isOpened: boolean;
  open: (event: Event) => void;
  close: () => void;
  formState: EditEventFormState;
  setFormState: (formState: Partial<EditEventFormState>) => void;
  errors: EditEventErrors;
  setErrors: (errors: EditEventErrors) => void;
  event: Event | null;
};

export const useEditEventStore = create<EditEventStore>()(set => ({
  isOpened: false,
  open: event =>
    set(state => ({
      isOpened: true,
      formState: {
        ...state.formState,
        car: event.car,
        championship: null,
        drivers: event.drivers as { id: string; name: string | null }[],
        duration: event.duration,
        newEventType: event.championshipId ? 'championship' : 'oneOff',
        time: dayjs(event.date).format('HH:mm'),
        title: event.title as string,
        track: event.track,
        type: event.type,
      },
      event,
    })),
  close: () =>
    set(() => ({
      isOpened: false,
      formState: defaultEventFormState,
      event: null,
    })),
  formState: defaultEventFormState,
  setFormState: formState =>
    set(state => ({
      ...state,
      formState: { ...state.formState, ...formState },
    })),
  errors: undefined,
  setErrors: errors => set(() => ({ errors })),
  event: null,
}));
