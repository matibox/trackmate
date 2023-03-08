import Form from '@ui/Form';
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
  position: '0',
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
        <div className='flex w-full flex-wrap justify-start gap-1'>
          {/*// TODO: form */}
        </div>
      </Form>
    </Popup>
  );
};

export default PostChampResult;
