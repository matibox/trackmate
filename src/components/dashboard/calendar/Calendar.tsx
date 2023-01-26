import Tile from '@ui/Tile';
import dayjs from 'dayjs';
import React, { type FC } from 'react';
import { useCalendarStore } from '../../../store/useCalendarStore';
import { Day } from './Day';
import CalendarHeader from './Header';

const Calendar: FC = () => {
  const { setPage, page } = useCalendarStore();
  useCalendarStore.subscribe(state => state.monthIndex, setPage);

  return (
    <Tile header={<CalendarHeader />}>
      <div className='grid grid-cols-7 grid-rows-[20px,_repeat(6,_minmax(0,_1fr))] place-items-center gap-2 text-slate-50 sm:gap-4'>
        {page?.[0]?.map((day, i) => (
          <div
            key={i}
            className='text-center text-xs font-semibold uppercase sm:text-base'
          >
            {dayjs(day).format('ddd')}
          </div>
        ))}
        {page.map((row, i) => (
          <React.Fragment key={i}>
            {row.map((day, i) => (
              <Day key={i} day={day} />
            ))}
          </React.Fragment>
        ))}
      </div>
    </Tile>
  );
};

export default Calendar;
