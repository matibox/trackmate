import Button from '@ui/Button';
import Form from '@ui/Form';
import Input from '@ui/Input';
import Label from '@ui/Label';
import Popup, { PopupHeader } from '~/components/common/Popup';
import { useState, type FC } from 'react';
import { z } from 'zod';
import { useError } from '../hooks/useError';
import useForm from '../hooks/useForm';
import { useChampResultStore } from '../store/useChampResultStore';
import { api } from '../utils/api';
import ErrorWrapper from '~/components/common/ErrorWrapper';

const formSchema = z.object({
  position: z.string().min(1, 'Position is required'),
  addToArchive: z.boolean(),
});

type FormSchema = z.infer<typeof formSchema>;

const defaultFormState: FormSchema = {
  position: '1',
  addToArchive: true,
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
    const { position, ...data } = values;
    postResult({
      ...data,
      position: parseInt(position),
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
          <ErrorWrapper error={errors?.addToArchive}>
            <Label
              label='Add to archive'
              className='flex flex-shrink flex-row items-center gap-2'
              optional
            >
              <input
                type='checkbox'
                checked={formState.addToArchive}
                onChange={e =>
                  setFormState(prev => ({
                    ...prev,
                    addToArchive: e.target.checked,
                  }))
                }
                className='-order-1 h-4 w-4 rounded accent-sky-500'
              />
            </Label>
          </ErrorWrapper>
        </div>
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
