import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import Tile from '@ui/Tile';
import { useState, type FC, useMemo } from 'react';
import { type RouterOutputs } from '~/utils/api';
import Event from './Event';
import { useRouter } from 'next/router';
import { RadioGroup } from '@headlessui/react';
import cn from '~/lib/classes';
import dayjs from 'dayjs';

type EventsProps = {
  profile: RouterOutputs['user']['getProfile'] | undefined;
  isLoading: boolean;
};

const Events: FC<EventsProps> = ({ profile, isLoading }) => {
  const router = useRouter();
  const { userId } = router.query;

  const [shownEvents, setShownEvents] = useState<'all' | 'upcoming' | 'past'>(
    'all'
  );

  const allEvents = useMemo(() => {
    if (!profile?.events) return [];
    return profile.events.map(event => ({
      ...event,
      isUpcoming: dayjs(event.date).isAfter(dayjs()),
    }));
  }, [profile?.events]);

  const upcomingEvents = useMemo(() => {
    if (!profile?.events) return [];
    return profile.events
      .filter(event => dayjs(event.date).isAfter(dayjs()))
      .reverse();
  }, [profile?.events]);

  const pastEvents = useMemo(() => {
    if (!profile?.events) return [];
    return profile.events.filter(event => dayjs(event.date).isBefore(dayjs()));
  }, [profile?.events]);

  return (
    <Tile
      className='md:col-span-2 xl:col-span-3'
      header={
        <div className='flex items-center gap-2'>
          <CalendarDaysIcon className='h-6' />
          <h1 className='text-lg font-semibold'>Events</h1>
          <RadioGroup
            value={shownEvents}
            onChange={setShownEvents}
            className='ml-auto flex items-center gap-2'
          >
            <RadioGroup.Option value='all'>
              {({ checked }) => (
                <span
                  className={cn(
                    'cursor-pointer rounded bg-slate-600 px-2 py-1 transition-colors hover:bg-slate-500',
                    {
                      'bg-sky-500 hover:bg-sky-400': checked,
                    }
                  )}
                >
                  All
                </span>
              )}
            </RadioGroup.Option>
            <RadioGroup.Option value='upcoming'>
              {({ checked }) => (
                <span
                  className={cn(
                    'cursor-pointer rounded bg-slate-600 px-2 py-1 transition-colors hover:bg-slate-500',
                    {
                      'bg-sky-500 hover:bg-sky-400': checked,
                    }
                  )}
                >
                  Upcoming
                </span>
              )}
            </RadioGroup.Option>
            <RadioGroup.Option value='past'>
              {({ checked }) => (
                <span
                  className={cn(
                    'cursor-pointer rounded bg-slate-600 px-2 py-1 transition-colors hover:bg-slate-500',
                    {
                      'bg-sky-500 hover:bg-sky-400': checked,
                    }
                  )}
                >
                  Past
                </span>
              )}
            </RadioGroup.Option>
          </RadioGroup>
        </div>
      }
      isLoading={isLoading}
      fixedHeader
    >
      <div className='grid grid-cols-[repeat(auto-fit,_min(100%,_22rem))] justify-center gap-4'>
        {shownEvents === 'upcoming'
          ? upcomingEvents.map(event => (
              <Event
                key={event.id}
                event={event}
                profileId={userId as string}
                upcoming={true}
              />
            ))
          : shownEvents === 'past'
          ? pastEvents.map(event => (
              <Event
                key={event.id}
                event={event}
                profileId={userId as string}
                upcoming={false}
              />
            ))
          : allEvents.map(event => (
              <Event
                key={event.id}
                event={event}
                profileId={userId as string}
                upcoming={event.isUpcoming}
              />
            ))}
        {profile?.events.length === 0 && !isLoading && (
          <span className='text-slate-300'>There are no events</span>
        )}
      </div>
    </Tile>
  );
};

export default Events;
