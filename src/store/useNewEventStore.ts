import type {
  NewEventErrors,
  NewEventFormState,
} from '@dashboard/events/NewEvent';
import { create } from 'zustand';

type NewEventStore = {
  isOpened: boolean;
  open: () => void;
  close: () => void;
  formState: NewEventFormState;
  setFormState: (formState: Partial<NewEventFormState>) => void;
  errors: NewEventErrors;
  setErrors: (errors: NewEventErrors) => void;
};

export const defaultEventFormState: NewEventFormState = {
  newEventType: 'oneOff',
  championship: null,
  title: '',
  car: '',
  track: '',
  drivers: [],
  type: null,
  duration: 0,
  time: '00:00',
};

export const useNewEventStore = create<NewEventStore>()(set => ({
  isOpened: false,
  open: () => set(() => ({ isOpened: true })),
  close: () =>
    set(() => ({
      isOpened: false,
      formState: defaultEventFormState,
    })),
  formState: defaultEventFormState,
  setFormState: formState =>
    set(state => ({
      ...state,
      formState: { ...state.formState, ...formState },
    })),
  errors: undefined,
  setErrors: errors => set(() => ({ errors })),
}));
