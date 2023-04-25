import { useState, type FC, useRef } from 'react';
import cn from '~/lib/classes';
import { useEventStore as useDetailedEventStore } from './store';
import Tab from './Tab';
import Tile from '@ui/Tile';
import Details from '~/components/common/Details';
import dayjs from 'dayjs';
import EventDuration from '~/components/common/EventDuration';
import { capitilize } from '~/utils/helpers';
import Button from '@ui/Button';
import {
  ClipboardDocumentCheckIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEventStore } from '../dashboard/events/store';
import Avatar from '~/components/common/Avatar';
import Link from 'next/link';
import Input from '@ui/Input';
import useForm from '~/hooks/useForm';
import { z } from 'zod';
import { api } from '~/utils/api';
import { useError } from '~/hooks/useError';
import { AnimatePresence, motion } from 'framer-motion';

const EventTabs: FC = () => {
  const { event, tabs, selectTab } = useDetailedEventStore();
  const {
    delete: { open: openDelete },
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        id: event!.id,
        ...values,
      });
    }
  );

  return (
    <div className='flex flex-col gap-5'>
      <div className='grid max-w-lg grid-cols-[repeat(auto-fit,_minmax(115px,_1fr))] gap-1'>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={cn(
              'rounded bg-slate-800 px-4 py-1 transition-colors focus:bg-slate-700 focus:outline-none hover:bg-slate-700',
              {
                'bg-sky-500 focus:bg-sky-400 focus:outline-none hover:bg-sky-500':
                  tab.selected,
              }
            )}
            onClick={() => selectTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {event && (
        <>
          <Tab showedOn='information'>
            <div className='flex gap-4'>
              {/*// TODO: past / future event indication */}
              {/*// ? mini calendar on the side on pc view */}
              <div className='flex w-48 flex-col gap-2'>
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
                  className={cn({
                    'ring-sky-500 hover:ring-sky-400': isEditing,
                  })}
                >
                  {isEditing ? (
                    <>
                      <span>Save changes</span>
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
                  >
                    <span>Cancel changes</span>
                    <XMarkIcon className='h-5' />
                  </Button>
                )}
                <Button
                  intent='subtleDanger'
                  onClick={() => openDelete(event)}
                  disabled={!!event?.result || isEditing}
                  title={!!event?.result ? "Can't delete ended event" : ''}
                >
                  <span>Delete event</span>
                  <TrashIcon className='h-5' />
                </Button>
              </div>
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
                        duration: parseInt(
                          durationRef.current?.value as string
                        ),
                      })
                    }
                  >
                    <Details
                      details={[
                        {
                          label: 'Event occurence',
                          value: dayjs(event?.date).format('YYYY MMM DD'),
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
                        value: dayjs(event?.date).format('YYYY MMM DD'),
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
            </div>
          </Tab>
          <Tab showedOn='drivers'>
            <div className='flex flex-wrap gap-4'>
              {event.drivers.map(driver => (
                <Tile key={driver.id} className='w-60'>
                  <div className='flex flex-col items-center justify-center'>
                    <Avatar
                      height={100}
                      width={100}
                      src={driver.image ?? ''}
                      alt={`${driver.name ?? 'driver'}'s profile picture`}
                      priority={true}
                      className='mb-2 flex items-center justify-center rounded-full text-center text-sm ring-1 ring-slate-700'
                    />
                    <Link
                      href={`/profile/${driver.id}`}
                      className='font-semibold transition-colors hover:text-sky-400'
                    >
                      <span>{driver.name}</span>
                    </Link>
                    {driver.team && (
                      <Link href={`/team/${driver.team.id}`}>
                        <span className='text-slate-400 underline decoration-slate-500/0 transition hover:decoration-slate-500'>
                          {driver.team.name}
                        </span>
                      </Link>
                    )}
                  </div>
                </Tile>
              ))}
            </div>
          </Tab>
          <Tab showedOn='setups'>setups</Tab>
          <Tab showedOn='result'>result</Tab>
        </>
      )}
    </div>
  );
};

export default EventTabs;
