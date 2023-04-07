import { RadioGroup } from '@headlessui/react';
import Popup, { PopupHeader } from '~/components/common/Popup';
import { useSession } from 'next-auth/react';
import { type FC } from 'react';
import cn from '../lib/classes';
import { useCalendarStore } from '../store/useCalendarStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { api } from '../utils/api';

const Settings: FC = () => {
  const {
    close,
    opened,
    setShowTeamEvents,
    setEventDurationType,
    settings: { showTeamEvents, eventDurationType },
  } = useSettingsStore();
  const { setTeamEvents, setLoading } = useCalendarStore();

  const { data: session } = useSession();

  const utils = api.useContext();

  const handleTeamEventsChange = async (fn: () => void) => {
    fn();
    setLoading(true);
    await new Promise(resolve =>
      setTimeout(() => resolve(utils.event.invalidate()), 100)
    ).finally(() => setLoading(false));
    setTeamEvents([]);
  };

  return (
    <Popup
      close={close}
      condition={opened}
      header={<PopupHeader close={close} title='Settings' />}
    >
      <div
        className={cn('flex flex-wrap', {
          'gap-16': session?.user?.teamId,
        })}
      >
        <div className='flex flex-col gap-2'>
          {session?.user?.teamId && (
            <>
              <h3 className='text-lg font-semibold'>Team events</h3>
              <RadioGroup
                value={showTeamEvents}
                onChange={value =>
                  void handleTeamEventsChange(() => setShowTeamEvents(value))
                }
                className='flex gap-2'
              >
                <RadioGroup.Option value={false}>
                  {({ checked }) => (
                    <span
                      className={cn(
                        'cursor-pointer rounded px-2 py-1 ring-1 ring-slate-700',
                        {
                          'bg-sky-500 ring-sky-400': checked,
                        }
                      )}
                    >
                      Hide
                    </span>
                  )}
                </RadioGroup.Option>
                <RadioGroup.Option value={true}>
                  {({ checked }) => (
                    <span
                      className={cn(
                        'cursor-pointer rounded px-2 py-1 ring-1 ring-slate-700',
                        {
                          'bg-sky-500 ring-sky-400': checked,
                        }
                      )}
                    >
                      Show
                    </span>
                  )}
                </RadioGroup.Option>
              </RadioGroup>
            </>
          )}
        </div>
        <div className='flex flex-col gap-2'>
          <h3 className='text-lg font-semibold'>Event duration</h3>
          <RadioGroup
            value={eventDurationType}
            onChange={setEventDurationType}
            className='flex gap-2'
          >
            <RadioGroup.Option value='minutes'>
              {({ checked }) => (
                <span
                  className={cn(
                    'cursor-pointer rounded px-2 py-1 ring-1 ring-slate-700',
                    {
                      'bg-sky-500 ring-sky-400': checked,
                    }
                  )}
                >
                  Minutes
                </span>
              )}
            </RadioGroup.Option>
            <RadioGroup.Option value='hours'>
              {({ checked }) => (
                <span
                  className={cn(
                    'cursor-pointer rounded px-2 py-1 ring-1 ring-slate-700',
                    {
                      'bg-sky-500 ring-sky-400': checked,
                    }
                  )}
                >
                  Hours
                </span>
              )}
            </RadioGroup.Option>
          </RadioGroup>
        </div>
      </div>
    </Popup>
  );
};

export default Settings;
