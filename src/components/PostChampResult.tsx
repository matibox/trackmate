import Button from '@ui/Button';
import Form from '@ui/Form';
import Input from '@ui/Input';
import Label from '@ui/Label';
import Popup from '@ui/Popup';
import PopupHeader from '@ui/PopupHeader';
import { useState, type FC } from 'react';
import { z } from 'zod';
import { useError } from '../hooks/useError';
import useForm from '../hooks/useForm';
import { useChampResultStore } from '../store/useChampResultStore';
import { api } from '../utils/api';

const formSchema = z.object({
  position: z.string().min(1, 'Position is required'),
  notes: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

const defaultFormState: FormSchema = {
  position: '1',
  notes: '',
};

const PostChampResult: FC = () => {
  const { isOpened, close, championship } = useChampResultStore();

  const [formState, setFormState] = useState<FormSchema>(defaultFormState);

  const { Error, setError } = useError();

  const utils = api.useContext();
  const { mutate: postResult, isLoading } =
    api.result.postChampionship.useMutation({
      onError: err => setError(err.message),
      onSuccess: async () => {
        close();
        setFormState(defaultFormState);
        await utils.championship.get.invalidate();
      },
    });

  const { handleSubmit, errors } = useForm(formSchema, values => {
    const { position, notes } = values;
    postResult({
      position: parseInt(position),
      notes: notes,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      championshipId: championship!.id,
    });
  });

  return (
    <Popup
      header={
        <PopupHeader
          close={close}
          title={`Post result for ${championship?.organizer ?? ''} - ${
            championship?.title ?? ''
          }`}
        />
      }
      close={close}
      condition={isOpened}
      isLoading={isLoading}
    >
      <Form onSubmit={e => handleSubmit(e, formState)}>
        <Label label='position'>
          <Input
            type='number'
            min={1}
            max={255}
            value={formState.position}
            onChange={e =>
              setFormState(prev => ({ ...prev, position: e.target.value }))
            }
            error={errors?.position}
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

export default PostChampResult;
