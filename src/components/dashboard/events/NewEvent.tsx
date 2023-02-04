import { type FormEvent, type FC, useEffect } from 'react';
import { useNewEventStore } from '../../../store/useNewEventStore';
import Popup from '@ui/Popup';
import PopupHeader from '@ui/PopupHeader';
import Button from '@ui/Button';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/20/solid';
import { useMultistepForm } from './useMultistepForm';
import NewEventType from './NewEventType';
import { z } from 'zod';
import Form from '@ui/Form';
import ChampEventDetails from './ChampEventDetails';
import OneOffEventDetails from './OneOffEventDetails';
import { eventTypes } from '../../../constants/constants';
import { api } from '../../../utils/api';
import { useError } from '../../../hooks/useError';
import { useCalendarStore } from '../../../store/useCalendarStore';
import { useSession } from 'next-auth/react';
import { hasRole } from '../../../utils/helpers';
import Loading from '@ui/Loading';

const driverSchema = z.object({ id: z.string(), name: z.string().nullable() });

export const formSchema = z
  .object({
    championship: z
      .object({
        id: z.string(),
        name: z.string(),
        car: z.string().nullable(),
        drivers: z.array(driverSchema),
        link: z.string().url(),
        managerId: z.string().nullable(),
        organizer: z.string(),
        type: z.enum(eventTypes),
        team: z.object({ id: z.string() }).nullable(),
      })
      .nullable(),
    newEventType: z.enum(['oneOff', 'championship']),
    title: z.string().min(1, 'Title is required'),
    car: z.string().min(1, 'Car is required'),
    track: z.string().min(1, 'Track is required'),
    drivers: z.array(driverSchema).nullable(),
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

const NewEvent: FC = () => {
  const { data: session } = useSession();
  const { close, isOpened, formState, setErrors } = useNewEventStore();
  const { selectedDay } = useCalendarStore();

  const steps = [
    <NewEventType key={0} />,
    <>
      {formState.newEventType === 'championship' ? (
        <ChampEventDetails />
      ) : (
        <OneOffEventDetails />
      )}
    </>,
  ];

  const { Error, setError } = useError();

  const { errors, handleSubmit, prev, next, step, stepIndex, isFirst, isLast } =
    useMultistepForm(steps, formSchema, values => {
      const { type, championship, time, ...data } = values;
      const date = new Date(
        `${selectedDay.format('YYYY-MM-DD')} ${time ?? '00:00'}`
      );

      if (values.newEventType === 'championship') {
        createChampEvent({
          ...data,
          date,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          championshipId: championship!.id,
          teamId: championship?.team?.id ?? null,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          type: type ?? championship!.type,
          managerId:
            hasRole(session, 'manager') &&
            (type === 'endurance' ||
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              championship!.type === 'endurance')
              ? session?.user?.id
              : undefined,
        });
      } else {
        createOneOffEvent({
          ...data,
          date,
          type: type ?? 'sprint',
          managerId:
            hasRole(session, 'manager') && values.type === 'endurance'
              ? session?.user?.id
              : undefined,
        });
      }
    });

  const utils = api.useContext();
  const { mutate: createChampEvent, isLoading: champLoading } =
    api.event.createChampionshipEvent.useMutation({
      onError(err) {
        setError(err.message);
      },
      async onSuccess() {
        closeAndReset();
        await utils.event.getDrivingEvents.invalidate();
        await utils.event.getManagingEvents.invalidate();
        await utils.team.getDriveFor.invalidate();
        await utils.championship.get.invalidate();
      },
    });
  const { mutate: createOneOffEvent, isLoading: oneOffLoading } =
    api.event.createOneOffEvent.useMutation({
      onError(err) {
        setError(err.message);
      },
      async onSuccess() {
        closeAndReset();
        await utils.event.getDrivingEvents.invalidate();
        await utils.event.getManagingEvents.invalidate();
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
      header={<PopupHeader title='new event' close={closeAndReset} />}
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
            disabled={champLoading || oneOffLoading}
          >
            <span>{isLast ? 'Submit' : 'Next'}</span>
            {champLoading || oneOffLoading ? (
              <Loading />
            ) : (
              <ArrowRightIcon className='h-5' />
            )}
          </Button>
        </div>
      </Form>
    </Popup>
  );
};

export default NewEvent;
