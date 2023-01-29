import { RadioGroup } from '@headlessui/react';
import { type EventType } from '@prisma/client';
import { Fragment, type FC } from 'react';
import { eventTypes } from '../../constants/constants';
import cn from '../../lib/classes';
import { api } from '../../utils/api';
import Label from './Label';

type EventTypePickerProps = {
  formState: {
    type: EventType;
  };
  setType: (type: EventType) => void;
};

const EventTypePicker: FC<EventTypePickerProps> = ({ formState, setType }) => {
  const { data: team, isLoading } = api.team.getDriveFor.useQuery();

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
            disabled={(type === 'endurance' && !team) || isLoading}
          >
            {({ checked, disabled }) => (
              <span
                className={cn('h-8 rounded px-3 py-1 ring-1 ring-slate-700', {
                  'ring-sky-500': checked,
                  'text-slate-700': disabled,
                })}
                title={
                  type === 'endurance' && !team
                    ? 'Join a team to drive endurance races'
                    : undefined
                }
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
