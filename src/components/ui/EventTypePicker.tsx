import { RadioGroup } from '@headlessui/react';
import { type EventType } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { Fragment, useCallback, type FC } from 'react';
import { eventTypes } from '../../constants/constants';
import cn from '../../lib/classes';
import { api } from '../../utils/api';
import { hasRole } from '../../utils/helpers';
import Label from './Label';

type EventTypePickerProps = {
  formState: {
    type: EventType;
  };
  setType: (type: EventType) => void;
  enduranceNeedsManager?: boolean;
};

const EventTypePicker: FC<EventTypePickerProps> = ({
  formState,
  setType,
  enduranceNeedsManager = false,
}) => {
  const { data: session } = useSession();
  const { data: team, isLoading } = api.team.getHasTeam.useQuery();

  const titleMessage = useCallback(
    (type: EventType) => {
      if (hasRole(session, 'driver') && hasRole(session, 'manager')) {
        if (!team && type === 'endurance')
          return 'Join a team to drive in endurance races';
        return '';
      } else if (hasRole(session, 'driver')) {
        if (type === 'endurance' && enduranceNeedsManager) {
          return 'You have to be a manager to create endurance championships for the team';
        }
        return '';
      } else {
        if (type === 'sprint')
          return 'You have to be a driver to create sprint championship';
        if (!team) return 'Join a team to create endurance races';
        return '';
      }
    },
    [enduranceNeedsManager, session, team]
  );

  const disabled = useCallback(
    (type: EventType) => {
      if (hasRole(session, 'driver') && hasRole(session, 'manager')) {
        if (type === 'endurance' && !team) return true;
        return false;
      }
      if (hasRole(session, 'driver')) {
        if (type === 'endurance') return true;
        return false;
      }
      if (hasRole(session, 'manager')) {
        if (type === 'sprint') return true;
        if (type === 'endurance' && !team) return true;
        return false;
      }
    },
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
            disabled={disabled(type) || isLoading}
          >
            {({ checked, disabled }) => (
              <span
                className={cn('h-8 rounded px-3 py-1 ring-1 ring-slate-700', {
                  'ring-sky-500': checked,
                  'text-slate-700': disabled,
                })}
                title={titleMessage(type)}
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
