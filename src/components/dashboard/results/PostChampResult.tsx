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
import { useChampResultStore } from '../../../store/useChampResultStore';
import { api } from '../../../utils/api';

const formSchema = z.object({
  position: z.string().min(1, 'Position is required'),
});

type FormSchema = z.infer<typeof formSchema>;

const defaultFormState: FormSchema = {
  position: '1',
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
    postResult({
      position: parseInt(values.position),
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
        <Error />
        <Button
          intent='primary'
          size='small'
          className='ml-auto h-min self-end'
        >
          Submit
        </Button>
      </Form>
    </Popup>
  );
};

export default PostChampResult;
