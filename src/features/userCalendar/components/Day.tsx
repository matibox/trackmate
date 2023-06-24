import dayjs from 'dayjs';
import { useMemo, type FC, useCallback } from 'react';
import { useCalendar } from '../hooks/useCalendar';
import { type RouterOutputs } from '~/utils/api';
import cn from '~/lib/classes';
import { useSession } from 'next-auth/react';
import crypto from 'crypto';

type DayProps = {
  day: dayjs.Dayjs;
};

const Day: FC<DayProps> = ({ day }) => {
  const {
    today,
    monthIndex,
    selectedDay,
    drivingEvents,
    managingEvents,
    incrementMonth,
    decrementMonth,
    selectDay,
  } = useCalendar();

  const isToday = useMemo(() => {
    return today.format('DD MM YYYY') === day.format('DD MM YYYY');
  }, [day, today]);

  const isDifferentMonth = useMemo(() => {
    return (
      dayjs(new Date(dayjs().year(), monthIndex)).format('MM') !==
      day.format('MM')
    );
  }, [day, monthIndex]);

  const isSelected = useMemo(() => {
    return day.format('DD MM YYYY') === selectedDay.format('DD MM YYYY');
  }, [day, selectedDay]);

  const getTodaysEvents = useCallback(
    (events: RouterOutputs['event']['getDrivingEvents'] | undefined) => {
      return events?.filter(
        event =>
          dayjs(event.date).format('DD MM YYYY') === day.format('DD MM YYYY')
      );
    },
    [day]
  );

  const dayDrivingEvents = getTodaysEvents(drivingEvents);
  const dayManagingEvents = getTodaysEvents(managingEvents);

  async function handleSelect() {
    selectDay(day);

    if (isDifferentMonth) {
      const currMonth = parseInt(
        dayjs(new Date(dayjs().year(), monthIndex)).format('M')
      );
      const targetMonth = parseInt(day.format('M'));
      if (currMonth === 1 && targetMonth === 12) return await decrementMonth();
      if (currMonth === 12 && targetMonth === 1) return await incrementMonth();
      if (currMonth < targetMonth) {
        await incrementMonth();
      } else {
        await decrementMonth();
      }
    }
  }

  return (
    <button
      className={cn(
        `flex aspect-square w-full flex-col items-center justify-center rounded font-semibold ring-1 ring-slate-700 sm:aspect-auto sm:h-10 sm:w-10`,
        {
          'bg-sky-500 ring-sky-400': isToday,
          'text-slate-600': isDifferentMonth,
          'ring-sky-400': isSelected,
          'ring-slate-50': isSelected && isToday,
        }
      )}
      onClick={() => void handleSelect}
    >
      <span>{dayjs(day).format('DD')}</span>
      <div className='flex h-1.5 gap-0.5'>
        {[...(dayDrivingEvents ?? []), ...(dayManagingEvents ?? [])].map(
          event => (
            <EventDot
              key={`${event.id}${crypto.randomBytes(4).toString('hex')}`}
              event={event}
              isToday={isToday}
            />
          )
        )}
      </div>
    </button>
  );
};

const EventDot: FC<{
  event: RouterOutputs['event']['getDrivingEvents'][number];
  isToday: boolean;
}> = ({ event, isToday }) => {
  const { data: session } = useSession();

  const isSprint = useMemo(() => event.type === 'sprint', [event.type]);
  const isEndurance = useMemo(() => event.type === 'endurance', [event.type]);

  const managing = useMemo(() => {
    if (!session?.user) return false;
    return event.managerId === session.user.id;
  }, [event.managerId, session?.user]);

  const driving = useMemo(() => {
    if (!session?.user) return false;
    return event.drivers.find(driver => driver.id === session.user?.id);
  }, [event.drivers, session?.user]);

  return (
    <div
      className={cn('h-1.5 w-1.5 rounded-full', {
        'bg-sky-500': isSprint && driving,
        'bg-sky-50': isSprint && driving && isToday,
        'bg-yellow-300': isEndurance && !driving && managing,
        'bg-amber-500': isEndurance && driving,
      })}
    />
  );
};

export default Day;
