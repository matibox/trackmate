import { useState, type FC, useMemo } from 'react';
import { useFinishStintStore } from '../store';
import Popup, { PopupHeader } from '~/components/common/Popup';
import Form from '@ui/Form';
import Label from '@ui/Label';
import Input from '@ui/Input';
import useForm from '~/hooks/useForm';
import { z } from 'zod';
import Button from '@ui/Button';
import dayjs from 'dayjs';

export const finishStint = z.object({
  duration: z.number({
    invalid_type_error: 'Stint duration is required',
    required_error: 'Stint duration is required',
  }),
});

const FinishStint: FC = () => {
  const { isOpened, close, stint } = useFinishStintStore();

  const [formState, setFormState] = useState<z.infer<typeof finishStint>>({
    duration: 0,
  });

  const { errors, handleSubmit } = useForm(finishStint, values => {
    const { duration } = values;
    console.log(duration);
  });

  const stintEndTime = useMemo(() => {
    return dayjs(stint?.start)
      .add(formState.duration || 0, 'minutes')
      .format('HH:mm');
  }, [formState.duration, stint?.start]);

  return (
    <Popup
      close={close}
      condition={isOpened}
      header={<PopupHeader close={close} title='Finish stint' />}
    >
      <Form onSubmit={e => handleSubmit(e, formState)}>
        <Label label='Duration (in minutes)'>
          <Input
            type='number'
            min={0}
            value={formState.duration.toString()}
            onChange={e =>
              setFormState(prev => ({
                ...prev,
                duration: parseInt(e.target.value),
              }))
            }
            error={errors?.duration}
          />
          <span>Stint end time: {stintEndTime}</span>
        </Label>
        <span className='text-slate-300'>
          Note: you won&apos;t be able to edit the stint later
        </span>
        <Button intent='primary' size='small' className='ml-auto self-end'>
          Submit
        </Button>
      </Form>
    </Popup>
  );
};

export default FinishStint;
