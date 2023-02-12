import dayjs, { type Dayjs } from 'dayjs';
import { useSession } from 'next-auth/react';
import { type FC, useMemo, useCallback } from 'react';
import cn from '../../../lib/classes';
import { useCalendarStore } from '../../../store/useCalendarStore';
import { type RouterOutputs } from '../../../utils/api';

interface DayProps {
  day: Dayjs;
}

export function Day({ day }: DayProps) {
  const {
    today,
    monthIndex,
    selectedDay,
    decrementMonth,
    incrementMonth,
    selectDay,
    drivingEvents,
    managingEvents,
    teamEvents,
  } = useCalendarStore();

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
  const dayTeamEvents = getTodaysEvents(teamEvents);

  function handleSelect() {
    selectDay(day);

    if (isDifferentMonth) {
      const currMonth = parseInt(
        dayjs(new Date(dayjs().year(), monthIndex)).format('M')
      );
      const targetMonth = parseInt(day.format('M'));
      if (currMonth === 1 && targetMonth === 12) return decrementMonth();
      if (currMonth === 12 && targetMonth === 1) return incrementMonth();
      if (currMonth < targetMonth) {
        incrementMonth();
      } else {
        decrementMonth();
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
      onClick={handleSelect}
    >
      <span>{dayjs(day).format('DD')}</span>
      <div className='flex h-1.5 gap-0.5'>
        {[
          ...(dayDrivingEvents ?? []),
          ...(dayManagingEvents ?? []),
          ...(dayTeamEvents ?? []),
        ].map(event => (
          <EventDot key={event.id} event={event} isToday={isToday} />
        ))}
      </div>
    </button>
  );
}

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
  const team = useMemo(() => {
    if (!session?.user) return false;
    return (
      !driving &&
      event.drivers.every(driver => driver.teamId === session.user?.teamId)
    );
  }, [driving, event.drivers, session?.user]);

  return (
    <div
      className={cn('h-1.5 w-1.5 rounded-full', {
        'bg-emerald-500': isSprint && team,
        'bg-sky-500': isSprint && driving,
        'bg-sky-50': isSprint && driving && isToday,
        'bg-rose-500': isEndurance && team,
        'bg-yellow-300': isEndurance && !driving && managing,
        'bg-amber-500': isEndurance && driving,
      })}
    />
  );
};
