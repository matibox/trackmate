import Tile from '@ui/Tile';
import dayjs from 'dayjs';
import { useSession } from 'next-auth/react';
import { type FC, Fragment, useState } from 'react';
import { useError } from '../../../hooks/useError';
import { usePersistHydration } from '../../../hooks/usePersistHydration';
import { useCalendarStore } from '../../../store/useCalendarStore';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { api } from '../../../utils/api';
import { hasRole } from '../../../utils/helpers';
import { Day } from './Day';
import CalendarHeader from './Header';
import { getCalendarPageBoundaries } from '../../../lib/dates';

const Calendar: FC = () => {
  const { data: session } = useSession();

  const {
    setPage,
    page,
    setDrivingEvents,
    setManagingEvents,
    setTeamEvents,
    loading: settingsLoading,
  } = useCalendarStore();
  useCalendarStore.subscribe(state => state.monthIndex, setPage);

  const [[firstDay, lastDay], setBoundaryDays] = useState(
    getCalendarPageBoundaries(page)
  );
  useCalendarStore.subscribe(
    state => state.page,
    page => {
      setBoundaryDays(getCalendarPageBoundaries(page));
    }
  );

  const showTeamEvents = usePersistHydration(
    useSettingsStore().settings.showTeamEvents
  );

  const { Error, setError } = useError();

  const { isInitialLoading: drivingEventsLoading } =
    api.event.getDrivingEvents.useQuery(
      {
        firstDay,
        lastDay,
      },
      {
        onSuccess: setDrivingEvents,
        onError: err => setError(err.message),
        enabled: Boolean(hasRole(session, 'driver')),
      }
    );
  const { isInitialLoading: managingEventsLoading } =
    api.event.getManagingEvents.useQuery(
      {
        firstDay,
        lastDay,
      },
      {
        onSuccess: setManagingEvents,
        onError: err => setError(err.message),
        enabled: Boolean(hasRole(session, 'manager')),
      }
    );
  const { isInitialLoading: teamEventsLoading } =
    api.event.getTeamEvents.useQuery(
      {
        firstDay,
        lastDay,
      },
      {
        onSuccess: setTeamEvents,
        onError: err => setError(err.message),
        enabled: showTeamEvents !== undefined && showTeamEvents,
      }
    );

  return (
    <Tile
      header={<CalendarHeader />}
      isLoading={
        drivingEventsLoading ||
        managingEventsLoading ||
        teamEventsLoading ||
        settingsLoading
      }
    >
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
          <Fragment key={i}>
            {row.map((day, i) => (
              <Day key={i} day={day} />
            ))}
          </Fragment>
        ))}
      </div>
      <Error />
    </Tile>
  );
};

export default Calendar;
