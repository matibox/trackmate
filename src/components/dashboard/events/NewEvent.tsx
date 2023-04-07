import { type FormEvent, type FC, useEffect } from 'react';
import Popup, { PopupHeader } from '~/components/common/Popup';
import Button from '@ui/Button';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/20/solid';
import { useMultistepForm } from './useMultistepForm';
import NewEventType from './NewEventType';
import { z } from 'zod';
import Form from '@ui/Form';
import ChampEventDetails from './ChampEventDetails';
import OneOffEventDetails from './OneOffEventDetails';
import { eventTypes, roles } from '../../../constants/constants';
import { api } from '../../../utils/api';
import { useError } from '../../../hooks/useError';
import { useCalendarStore } from '../../../store/useCalendarStore';
import { useSession } from 'next-auth/react';
import { hasRole } from '../../../utils/helpers';
import Loading from '@ui/Loading';
import { type EditEventFormState } from './EditEvent';
import type { allKeys } from '../../../types/utils';
import { useEventStore } from '../../../store/useEventStore';

const driverSchema = z.object({ id: z.string(), name: z.string().nullable() });

export const formSchema = z
  .object({
    session: z
      .object({
        expires: z.string(),
        user: z
          .object({
            id: z.string(),
            email: z.string().nullish(),
            image: z.string().nullish(),
            name: z.string().nullish(),
            teamId: z.string().nullable(),
            roles: z
              .array(z.object({ id: z.string(), name: z.enum(roles) }))
              .optional(),
          })
          .optional(),
      })
      .nullable(),
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
  .superRefine(
    ({ type, drivers, newEventType, championship, session }, ctx) => {
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

      if (
        newEventType === 'oneOff' &&
        type === 'endurance' &&
        drivers &&
        !hasRole(session, 'manager')
      ) {
        const user = drivers.find(driver => driver.id === session?.user?.id);
        if (!user) {
          ctx.addIssue({
            code: 'custom',
            path: ['drivers'],
            message: 'You have to be in a roster',
          });
        }
      }
    }
  );

export type NewEventFormState = z.infer<typeof formSchema>;

export type NewEventErrors =
  | {
      [P in allKeys<NewEventFormState>]?: string[] | undefined;
    }
  | undefined;

export type EventStepProps = {
  formState: NewEventFormState | EditEventFormState;
  setFormState: (
    formState: Partial<NewEventFormState>
  ) => void | ((formState: Partial<EditEventFormState>) => void);
};

const NewEvent: FC = () => {
  const { data: session } = useSession();
  const {
    close,
    isOpened,
    formState,
    setErrors,
    setFormState,
    errors: storeErrors,
  } = useEventStore().create;
  const { selectedDay } = useCalendarStore();

  const steps = [
    <NewEventType key={0} formState={formState} setFormState={setFormState} />,
    <>
      {formState.newEventType === 'championship' ? (
        <ChampEventDetails
          formState={formState}
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
      const { type, championship, time, ...data } = values;
      const date = new Date(
        `${selectedDay.format('YYYY-MM-DD')} ${time ?? '00:00'}`
      );

      if (values.newEventType === 'championship') {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { managerId, type: champType, id: champId } = championship!;
        createChampEvent({
          ...data,
          date,
          championshipId: champId,
          teamId: championship?.team?.id ?? null,
          type: type ?? champType,
          managerId: type === 'endurance' ? managerId ?? undefined : undefined,
        });
      } else {
        createOneOffEvent({
          ...data,
          date,
          type: type ?? 'sprint',
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
        await utils.event.invalidate();
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
    handleSubmit(e, { ...formState, session });
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
