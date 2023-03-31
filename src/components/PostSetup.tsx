import Button from '@ui/Button';
import Form from '@ui/Form';
import Input from '@ui/Input';
import Label from '@ui/Label';
import Popup from '@ui/Popup';
import PopupHeader from '@ui/PopupHeader';
import { type ChangeEvent, useState, type FC } from 'react';
import { z } from 'zod';
import { useError } from '../hooks/useError';
import useForm from '../hooks/useForm';
import { usePostSetupStore } from '../store/usePostSetupStore';
import { api } from '../utils/api';

const formSchema = z.object({
  setup: z
    .unknown()
    .refine(file => file !== null, 'You have to choose a setup'),
});

type Nullable<T extends object> = {
  [K in keyof T]: T[K] | null;
};

const PostSetup: FC = () => {
  const { close, isOpened } = usePostSetupStore();

  const [formState, setFormState] = useState<
    Nullable<z.infer<typeof formSchema>>
  >({
    setup: null,
  });

  const { Error, setError } = useError();

  const utils = api.useContext();
  const { mutate: uploadSetup, isLoading } = api.setup.upload.useMutation({
    onError: err => setError(err.message),
    onSuccess: async () => {
      await utils.setup.invalidate();
    },
  });

  const { handleSubmit, errors } = useForm(formSchema, values => {
    const setup = values.setup as File;
    const reader = new FileReader();

    reader.addEventListener('load', e => {
      void fetch(e.target?.result as string)
        .then(res => res.json())
        .then(res => {
          const data = res as Record<string, unknown>;
          uploadSetup({ data });
        });
    });
    reader.readAsDataURL(setup);
  });

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    if (!file) return setFormState(prev => ({ ...prev, setup: null }));
    setFormState(prev => ({ ...prev, setup: file }));
  }

  return (
    <Popup
      close={close}
      condition={isOpened}
      isLoading={isLoading}
      header={<PopupHeader close={close} title='Upload a setup' />}
    >
      <Form onSubmit={e => handleSubmit(e, formState)}>
        <Label label='Upload a setup'>
          <Input
            className='cursor-pointer rounded bg-transparent p-0 text-sm text-slate-50 focus:outline-none focus:ring focus:ring-sky-600'
            type='file'
            accept='.json'
            onChange={handleImageChange}
            error={errors?.setup}
          />
        </Label>
        <Button intent='primary' size='small' className='ml-auto self-end'>
          Upload
        </Button>
        <Error />
      </Form>
    </Popup>
  );
};

export default PostSetup;
