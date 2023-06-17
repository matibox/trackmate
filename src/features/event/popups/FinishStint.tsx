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
import { api } from '~/utils/api';
import { useError } from '~/hooks/useError';

export const finishStintSchema = z.object({
  duration: z.number({
    invalid_type_error: 'Stint duration is required',
    required_error: 'Stint duration is required',
  }),
});

const FinishStint: FC = () => {
  const { isOpened, close, stint } = useFinishStintStore();

  const [formState, setFormState] = useState<z.infer<typeof finishStintSchema>>(
    {
      duration: 0,
    }
  );

  const utils = api.useContext();
  const { Error, setError } = useError();

  const { mutate: finishStint, isLoading } = api.stint.finish.useMutation({
    onError: err => setError(err.message),
    onSuccess: async () => {
      await utils.event.single.invalidate();
      close();
    },
  });

  const { errors, handleSubmit } = useForm(finishStintSchema, values => {
    finishStint({
      stintId: stint?.id,
      ...values,
    });
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
      isLoading={isLoading}
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
      <Error />
    </Popup>
  );
};

export default FinishStint;
