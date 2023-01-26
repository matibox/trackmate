import dayjs, { type Dayjs } from 'dayjs';
import { useMemo } from 'react';
import cn from '../../../lib/classes';
import { useCalendarStore } from '../../../store/useCalendarStore';

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
    </button>
  );
}
