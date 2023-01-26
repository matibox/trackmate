import Tile from '@ui/Tile';
import dayjs from 'dayjs';
import { type FC } from 'react';
import { useCalendarStore } from '../../../store/useCalendarStore';
import CalendarHeader from './Header';

const Calendar: FC = () => {
  const { setPage } = useCalendarStore();
  useCalendarStore.subscribe(state => state.monthIndex, setPage);

  return (
    <Tile heading={<CalendarHeader />}>
      <div className='h-full w-full'></div>
    </Tile>
  );
};

export default Calendar;
