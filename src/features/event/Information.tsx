import { useState, type FC, useRef, Fragment, useMemo } from 'react';
import { useEventStore } from '../dashboard/events/store';
import { useError } from '~/hooks/useError';
import { api } from '~/utils/api';
import useForm from '~/hooks/useForm';
import { z } from 'zod';
import cn from '~/lib/classes';
import {
  ClipboardDocumentCheckIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Button from '@ui/Button';
import Tile from '@ui/Tile';
import Details from '~/components/common/Details';
import Input from '@ui/Input';
import { capitilize } from '~/utils/helpers';
import dayjs, { type Dayjs } from 'dayjs';
import EventDuration from '~/components/common/EventDuration';
import { Event } from '~/pages/event/[eventId]';
import { useRouter } from 'next/router';
import { getCalendarPage } from '~/lib/dates';

const Information: FC<{ event: Event }> = ({ event }) => {
  const router = useRouter();
  const {
    delete: { open: openDelete, setAdditionalActions },
  } = useEventStore();
  const [isEditing, setIsEditing] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const durationRef = useRef<HTMLInputElement>(null);
  const carRef = useRef<HTMLInputElement>(null);
  const trackRef = useRef<HTMLInputElement>(null);

  const { Error, setError } = useError();
  const utils = api.useContext();
  const { mutate: editEvent, isLoading } = api.event.edit.useMutation({
    onError: err => setError(err.message),
    onSuccess: async () => {
      await utils.event.invalidate();
      setIsEditing(false);
    },
  });

  const { handleSubmit, errors } = useForm(
    z.object({
      car: z.string().min(1, 'Car is required'),
      track: z.string().min(1, 'Track is required'),
      duration: z
        .number({ invalid_type_error: 'Duration is required' })
        .min(0, 'Duration needs to be a valid number'),
    }),
    values => {
      editEvent({
        id: event.id,
        ...values,
      });
    }
  );

  return (
    <div className='flex flex-col gap-4 sm:flex-row'>
      <MiniCalendar eventDate={event.date} />
      <Tile
        className={cn('grow', {
          'ring-sky-500': isEditing,
        })}
        isLoading={isLoading}
      >
        {isEditing ? (
          <form
            ref={formRef}
            onSubmit={e =>
              handleSubmit(e, {
                car: carRef.current?.value,
                track: trackRef.current?.value,
                duration: parseInt(durationRef.current?.value as string),
              })
            }
          >
            <Details
              details={[
                {
                  label: 'Event occurence',
                  value: dayjs(event?.date).format('dddd HH:mm, DD MMM YYYY'),
                },
                {
                  label: 'Duration (in minutes)',
                  value: (
                    <Input
                      defaultValue={event.duration}
                      error={errors?.duration}
                      ref={durationRef}
                      className='max-w-xs'
                    />
                  ),
                },
                {
                  label: 'Event type',
                  value: capitilize(event.type),
                },
                {
                  label: 'Manager',
                  value: event?.manager?.name,
                  condition: !!event?.manager,
                },
                {
                  label: 'Car',
                  value: (
                    <Input
                      defaultValue={event.car}
                      error={errors?.car}
                      ref={carRef}
                      className='max-w-xs'
                    />
                  ),
                },
                {
                  label: 'Track',
                  value: (
                    <Input
                      defaultValue={event.track}
                      error={errors?.track}
                      ref={trackRef}
                      className='max-w-xs'
                    />
                  ),
                },
              ]}
            />
          </form>
        ) : (
          <Details
            details={[
              {
                label: 'Event occurence',
                value: dayjs(event?.date).format('dddd HH:mm, DD MMM YYYY'),
              },
              {
                label: 'Duration',
                value: <EventDuration duration={event.duration} />,
              },
              {
                label: 'Event type',
                value: capitilize(event.type),
              },
              {
                label: 'Manager',
                value: event?.manager?.name,
                condition: !!event?.manager,
              },
              {
                label: 'Car',
                value: capitilize(event?.car),
              },
              {
                label: 'Track',
                value: capitilize(event?.track),
              },
            ]}
          />
        )}
        <Error />
      </Tile>
      <div className='flex w-full flex-wrap gap-2 sm:w-48 sm:flex-col sm:flex-nowrap'>
        <Button
          intent='secondary'
          onClick={() => {
            if (isEditing) {
              formRef.current?.dispatchEvent(
                new Event('submit', { cancelable: true, bubbles: true })
              );
            } else {
              setIsEditing(true);
            }
          }}
          disabled={!!event?.result}
          title={!!event?.result ? "Can't edit ended event" : ''}
          className={cn('grow sm:grow-0', {
            'basis-[calc(50%_-_0.5rem)] ring-sky-500 hover:ring-sky-400 sm:basis-auto':
              isEditing,
          })}
        >
          {isEditing ? (
            <>
              <span>Save</span>
              <ClipboardDocumentCheckIcon className='h-5' />
            </>
          ) : (
            <>
              <span>Edit event</span>
              <PencilSquareIcon className='h-5' />
            </>
          )}
        </Button>
        {isEditing && (
          <Button
            intent='secondary'
            onClick={() => setIsEditing(false)}
            disabled={isLoading}
            className='grow basis-[calc(50%_-_0.5rem)] sm:grow-0 sm:basis-auto'
          >
            <span>Cancel</span>
            <XMarkIcon className='h-5' />
          </Button>
        )}
        <Button
          intent='subtleDanger'
          onClick={() => {
            setAdditionalActions(async () => {
              await router.push('/');
            });
            openDelete(event);
          }}
          disabled={!!event?.result || isEditing}
          title={!!event?.result ? "Can't delete ended event" : ''}
          className='grow sm:grow-0'
        >
          <span>Delete event</span>
          <TrashIcon className='h-5' />
        </Button>
      </div>
    </div>
  );
};

const MiniCalendar: FC<{ eventDate: Date }> = ({ eventDate }) => {
  const page = getCalendarPage(dayjs(eventDate).month());
  return (
    <Tile className='hidden md:flex'>
      <div className='flex h-full w-full items-center justify-center'>
        <div className='grid grid-cols-7 grid-rows-[20px,_repeat(6,_minmax(0,_1fr))] place-items-center gap-2 text-slate-50'>
          {page[0]?.map((day, i) => (
            <span key={i}>{dayjs(day).format('dd')}</span>
          ))}
          {page.map((row, i) => (
            <Fragment key={i}>
              {row.map((day, i) => (
                <Day
                  key={i}
                  day={day}
                  isEventDay={day.isSame(
                    dayjs(
                      new Date(
                        dayjs(eventDate).year(),
                        dayjs(eventDate).month(),
                        dayjs(eventDate).date()
                      )
                    )
                  )}
                />
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </Tile>
  );
};

const Day: FC<{ day: Dayjs; isEventDay: boolean }> = ({ day, isEventDay }) => {
  const isDifferentMonth = useMemo(() => {
    return (
      dayjs(new Date(dayjs().year(), dayjs().month())).format('MM') !==
      day.format('MM')
    );
  }, [day]);

  const isToday = useMemo(() => {
    return dayjs().format('YYYY MM DD') === day.format('YYYY MM DD');
  }, [day]);

  return (
    <div
      className={cn('flex items-center justify-center px-1', {
        'text-slate-400': isDifferentMonth,
        'rounded ring-1 ring-slate-300': isToday,
        'font-semibold text-sky-400': isEventDay,
        'ring-sky-400': isEventDay && isToday,
      })}
    >
      {day.format('DD')}
    </div>
  );
};

export default Information;
