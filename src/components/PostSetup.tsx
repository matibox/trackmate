import Button from '@ui/Button';
import Form from '@ui/Form';
import Input from '@ui/Input';
import Label from '@ui/Label';
import Popup from '@ui/Popup';
import PopupHeader from '@ui/PopupHeader';
import { useSession } from 'next-auth/react';
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
  shareWithTeam: z.boolean(),
});

type Nullable<T extends object> = {
  [K in keyof T]: T[K] | null;
};

const PostSetup: FC = () => {
  const { close, isOpened, event } = usePostSetupStore();
  const { data: session } = useSession();

  const [formState, setFormState] = useState<
    Nullable<z.infer<typeof formSchema>>
  >({
    setup: null,
    shareWithTeam: false,
  });

  const { Error, setError } = useError();

  const { mutate: uploadSetup, isLoading } = api.setup.upload.useMutation({
    onError: err => setError(err.message),
  });

  const { handleSubmit, errors } = useForm(formSchema, values => {
    const setup = values.setup as File;
    const reader = new FileReader();

    reader.addEventListener('load', e => {
      void fetch(e.target?.result as string)
        .then(res => res.json())
        .then(res => {
          const data = res as Record<string, unknown>;
          const { shareWithTeam } = values;
          uploadSetup({ data, shareWithTeam });
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
      header={
        <PopupHeader
          close={close}
          title={`Add setup for ${event?.name ?? 'event'}`}
        />
      }
    >
      <Form onSubmit={e => handleSubmit(e, formState)}>
        <div className='flex w-full flex-col gap-4 sm:w-auto sm:flex-1'>
          {session?.user?.teamId && (
            <Label
              label='Share with team'
              className='flex flex-shrink flex-row items-center gap-2'
              optional
            >
              <input
                type='checkbox'
                checked={formState.shareWithTeam ?? false}
                onChange={e =>
                  setFormState(prev => ({
                    ...prev,
                    shareWithTeam: e.target.checked,
                  }))
                }
                disabled={!session?.user?.teamId}
                className='-order-1 h-4 w-4 rounded accent-sky-500'
              />
            </Label>
          )}
          <Label label='Upload setup'>
            <Input
              className='cursor-pointer rounded bg-transparent p-0 text-sm text-slate-50 focus:outline-none focus:ring focus:ring-sky-600'
              type='file'
              accept='.json'
              onChange={handleImageChange}
              error={errors?.setup}
            />
          </Label>
        </div>
        <Button intent='primary' size='small' className='ml-auto self-end'>
          Upload
        </Button>
        <Error />
      </Form>
    </Popup>
  );
};

export default PostSetup;
