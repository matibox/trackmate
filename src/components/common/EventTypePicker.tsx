import { RadioGroup } from '@headlessui/react';
import { type EventType } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { Fragment, useMemo, type FC } from 'react';
import { eventTypes } from '~/constants/constants';
import cn from '~/lib/classes';
import { api } from '~/utils/api';
import { hasRole } from '~/utils/helpers';
import Label from '@ui/Label';

type EventTypePickerProps = {
  formState: {
    type: EventType | null;
  };
  setType: (type: EventType | null) => void;
};

const EventTypePicker: FC<EventTypePickerProps> = ({ formState, setType }) => {
  const { data: session } = useSession();
  const { data: team, isLoading } = api.team.getHasTeam.useQuery();

  const titleMessage = useMemo(() => {
    if ((hasRole(session, 'driver') || hasRole(session, 'manager')) && !team) {
      return 'Join a team to create endurance events/championships';
    }
    return '';
  }, [session, team]);

  const enduranceDisabled = useMemo(
    () => (hasRole(session, 'driver') || hasRole(session, 'manager')) && !team,
    [session, team]
  );

  return (
    <Label label='race type' className='grid-rows-[1.5rem,2rem]'>
      <RadioGroup
        value={formState.type}
        onChange={type => setType(type)}
        className='flex gap-3'
      >
        {eventTypes.map(type => (
          <RadioGroup.Option
            key={type}
            value={type}
            as={Fragment}
            disabled={
              type === 'endurance' ? enduranceDisabled : false || isLoading
            }
          >
            {({ checked, disabled }) => (
              <span
                className={cn('h-8 rounded px-3 py-1 ring-1 ring-slate-700', {
                  'ring-sky-500': checked,
                  'text-slate-700': disabled,
                })}
                title={type === 'endurance' ? titleMessage : ''}
              >
                {type}
              </span>
            )}
          </RadioGroup.Option>
        ))}
      </RadioGroup>
    </Label>
  );
};

export default EventTypePicker;
