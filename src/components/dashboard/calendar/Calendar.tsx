import Tile from '@ui/Tile';
import { type FC } from 'react';
import { useCalendarStore } from '../../../store/useCalendarStore';
import CalendarHeading from './Heading';

const Calendar: FC = () => {
  const { setPage } = useCalendarStore();
  useCalendarStore.subscribe(state => state.monthIndex, setPage);

  return (
    <Tile heading={<CalendarHeading />}>
      <div className='h-full w-full'></div>
    </Tile>
  );
};

export default Calendar;
