import DriversPicker from '@ui/DriversPicker';
import EventTypePicker from '@ui/EventTypePicker';
import Input from '@ui/Input';
import Label from '@ui/Label';
import { type FC } from 'react';
import { useCalendarStore } from '../../../store/useCalendarStore';
import type { EditEventErrors } from './EditEvent';
import type { EventStepProps, NewEventErrors } from './NewEvent';

type OneOffEventDetailsProps = EventStepProps & {
  errors: NewEventErrors | EditEventErrors;
};

const OneOffEventDetails: FC<OneOffEventDetailsProps> = ({
  formState,
  setFormState,
  errors,
}) => {
  const { selectedDay } = useCalendarStore();

  console.log(formState);

  return (
    <>
      <Label label='title'>
        <Input
          type='text'
          value={formState.title}
          onChange={e => setFormState({ title: e.target.value })}
          error={errors?.title}
        />
      </Label>
      <Label label='car'>
        <Input
          type='text'
          value={formState.car}
          onChange={e => setFormState({ car: e.target.value })}
          error={errors?.car}
        />
      </Label>
      <Label label='track'>
        <Input
          type='text'
          value={formState.track}
          onChange={e => setFormState({ track: e.target.value })}
          error={errors?.track}
        />
      </Label>
      <Label label='duration in minutes'>
        <Input
          type='number'
          value={formState.duration.toString()}
          onChange={e => setFormState({ duration: e.target.valueAsNumber })}
          error={errors?.duration}
        />
      </Label>
      <Label label='starting time'>
        <Input
          type='time'
          value={formState.time ?? '00:00'}
          onChange={e => setFormState({ time: e.target.value })}
          error={errors?.time}
        />
      </Label>
      <EventTypePicker
        formState={formState}
        setType={type => setFormState({ type })}
        enduranceNeedsManager
      />
      <DriversPicker
        formState={{ ...formState, teammates: formState.drivers }}
        setTeammates={drivers => setFormState({ drivers })}
        errors={{ teammates: errors?.drivers }}
      />
      <div className='flex w-full flex-wrap gap-16'>
        <div className='flex flex-col'>
          <span className='text-slate-300'>Date</span>
          <span>{selectedDay.format('DD MMM YYYY')}</span>
        </div>
      </div>
    </>
  );
};

export default OneOffEventDetails;
