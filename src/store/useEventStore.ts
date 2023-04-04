import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { type RouterOutputs } from '../utils/api';
import type {
  EditEventErrors,
  EditEventFormState,
} from '@dashboard/events/EditEvent';
import type {
  NewEventErrors,
  NewEventFormState,
} from '@dashboard/events/NewEvent';
import dayjs from 'dayjs';

type Event = RouterOutputs['event']['getDrivingEvents'][number];

type DeleteEvent = Pick<Event, 'id' | 'title' | 'championship'>;

export const defaultEventFormState: NewEventFormState = {
  session: null,
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

type EventStore = {
  delete: {
    event: DeleteEvent | null;
    isOpened: boolean;
    open: (event: DeleteEvent) => void;
    close: () => void;
  };
  edit: {
    isOpened: boolean;
    open: (event: Event) => void;
    close: () => void;
    formState: EditEventFormState;
    setFormState: (formState: Partial<EditEventFormState>) => void;
    errors: EditEventErrors;
    setErrors: (errors: EditEventErrors) => void;
    event: Event | null;
  };
  create: {
    isOpened: boolean;
    open: () => void;
    close: () => void;
    formState: NewEventFormState;
    setFormState: (formState: Partial<NewEventFormState>) => void;
    errors: NewEventErrors;
    setErrors: (errors: NewEventErrors) => void;
  };
  setups: {
    isOpened: boolean;
    open: (event: DeleteEvent | null) => void;
    close: () => void;
    event: DeleteEvent | null;
  };
};

export const useEventStore = create<EventStore>()(
  immer(set => ({
    delete: {
      event: null,
      isOpened: false,
      open: event =>
        set(state => {
          state.delete.event = event;
          state.delete.isOpened = true;
        }),
      close: () =>
        set(state => {
          state.delete.event = null;
          state.delete.isOpened = false;
        }),
    },
    edit: {
      isOpened: false,
      open: event =>
        set(state => {
          state.edit.isOpened = true;
          (state.edit.formState = {
            car: event.car,
            championship: null,
            drivers: event.drivers.map(driver => ({
              id: driver.id,
              name: driver.name,
            })),
            duration: event.duration,
            newEventType: event.championshipId ? 'championship' : 'oneOff',
            time: dayjs(event.date).format('HH:mm'),
            title: event.title as string,
            track: event.track,
            type: event.type,
          }),
            (state.edit.event = event);
        }),
      close: () =>
        set(state => {
          (state.edit.isOpened = false),
            (state.edit.formState = defaultEventFormState),
            (state.edit.event = null);
        }),
      formState: defaultEventFormState,
      setFormState: formState =>
        set(state => {
          state.edit.formState = { ...state.edit.formState, ...formState };
        }),
      errors: undefined,
      setErrors: errors =>
        set(state => {
          state.edit.errors = errors;
        }),
      event: null,
    },
    create: {
      isOpened: false,
      open: () =>
        set(state => {
          state.create.isOpened = true;
        }),
      close: () =>
        set(state => {
          state.create.isOpened = false;
          state.create.formState = defaultEventFormState;
        }),
      formState: defaultEventFormState,
      setFormState: formState =>
        set(state => {
          state.create.formState = { ...state.create.formState, ...formState };
        }),
      errors: undefined,
      setErrors: errors =>
        set(state => {
          state.create.errors = errors;
        }),
    },
    setups: {
      event: null,
      isOpened: false,
      open: event =>
        set(state => {
          state.setups.event = event;
          state.setups.isOpened = true;
        }),
      close: () =>
        set(state => {
          state.setups.event = null;
          state.setups.isOpened = false;
        }),
    },
  }))
);
