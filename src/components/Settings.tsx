import Popup from '@ui/Popup';
import PopupHeader from '@ui/PopupHeader';
import { type FC } from 'react';
import cn from '../lib/classes';
import { useCalendarStore } from '../store/useCalendarStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { api } from '../utils/api';

const Settings: FC = () => {
  const {
    close,
    opened,
    hideTeamEventsFn,
    showTeamEventsFn,
    settings: { showTeamEvents },
  } = useSettingsStore();
  const { setTeamEvents } = useCalendarStore();

  const utils = api.useContext();

  const handleTeamEventsChange = async (fn: () => void) => {
    fn();
    await new Promise(resolve =>
      setTimeout(() => resolve(utils.event.invalidate()), 100)
    );
    setTeamEvents([]);
  };

  return (
    <Popup
      close={close}
      condition={opened}
      header={<PopupHeader close={close} title='Settings' />}
    >
      <div>
        <h2 className='mb-1 text-lg font-semibold'>Calendar</h2>
        <span className='mb-1 block'>Team events</span>
        <div className='flex w-min items-center justify-evenly gap-1 rounded bg-slate-800 ring-1 ring-slate-700'>
          <button
            className={cn('px-2 py-0.5', {
              'bg-slate-700': !showTeamEvents,
            })}
            onClick={() => void handleTeamEventsChange(hideTeamEventsFn)}
          >
            hide
          </button>
          <button
            className={cn('px-2 py-0.5', {
              'bg-slate-700': showTeamEvents,
            })}
            onClick={() => void handleTeamEventsChange(showTeamEventsFn)}
          >
            show
          </button>
        </div>
      </div>
    </Popup>
  );
};

export default Settings;
