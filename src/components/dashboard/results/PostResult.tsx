import Button from '@ui/Button';
import Form from '@ui/Form';
import Input from '@ui/Input';
import Label from '@ui/Label';
import Popup from '@ui/Popup';
import PopupHeader from '@ui/PopupHeader';
import { useState, type FC } from 'react';
import { z } from 'zod';
import { useError } from '../../../hooks/useError';
import useForm from '../../../hooks/useForm';
import { useResultStore } from '../../../store/useResultStore';
import { api } from '../../../utils/api';

const formSchema = z.object({
  qualiPosition: z
    .number({ invalid_type_error: 'Qualifying position is required' })
    .min(1),
  racePosition: z
    .number({ invalid_type_error: 'Race position is required' })
    .min(1),
  notes: z.string().optional(),
});

const defaultFormState: z.infer<typeof formSchema> = {
  qualiPosition: 1,
  racePosition: 1,
  notes: '',
};

const PostResult: FC = () => {
  const { isOpened, close, event } = useResultStore();

  const [formState, setFormState] =
    useState<z.infer<typeof formSchema>>(defaultFormState);

  const { Error, setError } = useError();
  const { handleSubmit, errors } = useForm(formSchema, values => {
    postResult({
      ...values,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      eventId: event!.id,
    });
  });

  //TODO invalidate get results manager query
  const utils = api.useContext();
  const { mutate: postResult, isLoading } = api.result.post.useMutation({
    async onSuccess() {
      close();
      setFormState(defaultFormState);
      await utils.event.getDrivingEvents.invalidate();
      await utils.event.getManagingEvents.invalidate();
      await utils.championship.get.invalidate();
    },
    onError: err => setError(err.message),
  });

  return (
    <Popup
      header={
        <PopupHeader
          close={close}
          title={`Post result for ${event?.title ?? ''}`}
        />
      }
      close={close}
      condition={isOpened}
      isLoading={isLoading}
    >
      <Form onSubmit={e => handleSubmit(e, formState)}>
        <Label label='qualifying position'>
          <Input
            type='number'
            min={1}
            max={255}
            value={formState.qualiPosition.toString()}
            onChange={e =>
              setFormState(prev => ({
                ...prev,
                qualiPosition: e.target.valueAsNumber,
              }))
            }
            error={errors?.qualiPosition}
          />
        </Label>
        <Label label='race position'>
          <Input
            type='number'
            min={1}
            max={255}
            value={formState.racePosition.toString()}
            onChange={e =>
              setFormState(prev => ({
                ...prev,
                racePosition: e.target.valueAsNumber,
              }))
            }
            error={errors?.racePosition}
          />
        </Label>
        <Label label='notes' optional className='sm:w-full'>
          <textarea
            className='h-24 w-full resize-none appearance-none rounded px-2 py-1 tracking-tight text-slate-900 scrollbar-thin scrollbar-track-slate-300 scrollbar-thumb-sky-500 selection:bg-sky-500 selection:text-slate-50 focus:outline-none focus:ring focus:ring-sky-600'
            maxLength={65535}
            value={formState.notes}
            onChange={e =>
              setFormState(prev => ({
                ...prev,
                notes: e.target.value,
              }))
            }
          ></textarea>
        </Label>
        <Error />
        <Button intent='primary' size='small' className='ml-auto'>
          Submit
        </Button>
      </Form>
    </Popup>
  );
};

export default PostResult;
