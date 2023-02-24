import { type FormEvent, type FC, useEffect } from 'react';
import Popup from '@ui/Popup';
import PopupHeader from '@ui/PopupHeader';
import Button from '@ui/Button';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/20/solid';
import { useMultistepForm } from './useMultistepForm';
import NewEventType from './NewEventType';
import Form from '@ui/Form';
import ChampEventDetails from './ChampEventDetails';
import OneOffEventDetails from './OneOffEventDetails';
import { api } from '../../../utils/api';
import { useError } from '../../../hooks/useError';
import Loading from '@ui/Loading';
import { useEditEventStore } from '../../../store/useEditEventStore';
import { z } from 'zod';
import { eventTypes } from '../../../constants/constants';
import type { allKeys } from '../../../types/utils';
import dayjs from 'dayjs';
import { useCalendarStore } from '../../../store/useCalendarStore';
import type { NewEventFormState } from './NewEvent';

export const formSchema = z
  .object({
    championship: z
      .object({
        id: z.string(),
        name: z.string(),
        organizer: z.string(),
      })
      .nullable(),
    newEventType: z.enum(['oneOff', 'championship']),
    title: z.string().min(1, 'Title is required'),
    car: z.string().min(1, 'Car is required'),
    track: z.string().min(1, 'Track is required'),
    drivers: z
      .array(z.object({ id: z.string(), name: z.string().nullable() }))
      .nullable(),
    type: z.enum(eventTypes).nullable().default('sprint'),
    duration: z
      .number({ invalid_type_error: 'Duration is required' })
      .min(0, 'Duration needs to be a valid number'),
    time: z.string(),
  })
  .superRefine(({ type, drivers, newEventType, championship }, ctx) => {
    if ((type === 'endurance' && drivers && drivers.length < 2) || !drivers) {
      ctx.addIssue({
        code: 'too_small',
        minimum: 2,
        inclusive: true,
        type: 'array',
        path: ['drivers'],
        message: 'Pick at least 2 drivers for endurance events.',
      });
    }

    if (newEventType === 'championship' && !championship) {
      ctx.addIssue({
        code: 'invalid_type',
        expected: 'object',
        received: 'null',
        path: ['championship'],
        message: 'You have to pick a championship',
      });
    }
  });

export type EditEventFormState = z.infer<typeof formSchema>;
export type EditEventErrors =
  | {
      [P in allKeys<EditEventFormState>]?: string[] | undefined;
    }
  | undefined;

const EditEvent: FC = () => {
  const {
    close,
    isOpened,
    formState,
    setErrors,
    errors: storeErrors,
    event,
    setFormState,
  } = useEditEventStore();
  const { selectedDay } = useCalendarStore();

  const steps = [
    <NewEventType key={0} formState={formState} setFormState={setFormState} />,
    <>
      {formState.newEventType === 'championship' ? (
        <ChampEventDetails
          formState={formState as NewEventFormState}
          setFormState={setFormState}
          errors={storeErrors}
        />
      ) : (
        <OneOffEventDetails
          formState={formState}
          setFormState={setFormState}
          errors={storeErrors}
        />
      )}
    </>,
  ];

  const { Error, setError } = useError();

  const { errors, handleSubmit, prev, next, step, stepIndex, isFirst, isLast } =
    useMultistepForm(steps, formSchema, values => {
      const { time, ...data } = values;
      editEvent({
        id: event?.id as string,
        date: dayjs(`${selectedDay.format('YYYY-MM-DD')} ${time}`).toDate(),
        ...data,
      });
    });

  const utils = api.useContext();
  const { mutate: editEvent, isLoading } = api.event.edit.useMutation({
    onError(err) {
      setError(err.message);
    },
    async onSuccess() {
      closeAndReset();
      await utils.event.invalidate();
      await utils.team.getDriveFor.invalidate();
      await utils.championship.get.invalidate();
    },
  });

  useEffect(() => {
    setErrors(errors);
  }, [errors, setErrors]);

  function handlePrevStep() {
    if (!isFirst) return prev();
  }

  function handleNextStep(e: FormEvent) {
    e.preventDefault();
    if (!isLast) return next();
    handleSubmit(e, formState);
  }

  function closeAndReset() {
    for (let i = 0; i < stepIndex; i++) {
      handlePrevStep();
    }
    close();
  }

  return (
    <Popup
      close={closeAndReset}
      condition={isOpened}
      header={<PopupHeader title='edit event' close={closeAndReset} />}
      className='max-w-3xl'
    >
      <Form onSubmit={handleNextStep} className='items-start'>
        {step}
        <Error />
        <div className='flex w-full justify-between'>
          <Button
            intent='primary'
            size='small'
            gap='small'
            className='self-end'
            type='button'
            onClick={handlePrevStep}
            disabled={isFirst}
          >
            <ArrowLeftIcon className='h-5' />
            <span>Prev</span>
          </Button>
          <Button
            intent='primary'
            size='small'
            gap='small'
            className='self-end'
            type='submit'
            disabled={isLoading}
          >
            <span>{isLast ? 'Submit' : 'Next'}</span>
            {isLoading ? <Loading /> : <ArrowRightIcon className='h-5' />}
          </Button>
        </div>
      </Form>
    </Popup>
  );
};

export default EditEvent;
