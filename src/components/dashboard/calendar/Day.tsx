import dayjs, { type Dayjs } from 'dayjs';
import { useSession } from 'next-auth/react';
import { type FC, useMemo } from 'react';
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

  const dayDrivingEvents = useMemo(() => {
    return drivingEvents?.filter(
      event =>
        dayjs(event.date).format('DD MM YYYY') === day.format('DD MM YYYY')
    );
  }, [drivingEvents, day]);

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
        {dayDrivingEvents?.slice(0, 4).map(event => (
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

  return (
    <div
      className={cn('h-1.5 w-1.5 rounded-full', {
        'bg-yellow-300': isEndurance && managing,
        'bg-sky-500': isSprint,
        'bg-slate-50': isSprint && isToday,
        'bg-amber-500': isEndurance,
      })}
    />
  );
};
