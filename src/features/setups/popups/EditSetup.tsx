import Button from '@ui/Button';
import Form from '@ui/Form';
import Input from '@ui/Input';
import Label from '@ui/Label';
import Popup, { PopupHeader } from '~/components/common/Popup';
import { type ChangeEvent, useState, type FC, useEffect } from 'react';
import { z } from 'zod';
import { useError } from '~/hooks/useError';
import useForm from '~/hooks/useForm';
import { api } from '~/utils/api';
import { useSetupStore } from '../store';

const formSchema = z.object({
  setup: z.unknown(),
  car: z.string().min(1, 'Car is required'),
  track: z.string().min(1, 'Track is required'),
});

type Nullable<T extends object, K extends keyof T> = {
  [P in keyof T]: P extends K ? T[P] | null : T[P];
};

const EditSetup: FC = () => {
  const {
    edit: { close, isOpened, setup },
  } = useSetupStore();

  const [formState, setFormState] = useState<
    Nullable<z.infer<typeof formSchema>, 'setup'>
  >({
    setup: null,
    car: '',
    track: '',
  });

  useEffect(() => {
    if (!setup) return;
    setFormState({ setup: null, car: setup.car, track: setup.track });
  }, [setup]);

  const { Error, setError } = useError();

  const utils = api.useContext();
  const { mutate: editSetup, isLoading } = api.setup.edit.useMutation({
    onError: err => setError(err.message),
    onSuccess: async () => {
      await utils.setup.invalidate();
      close();
    },
  });

  const { handleSubmit, errors } = useForm(formSchema, values => {
    const setupFile = values.setup;

    if (setupFile instanceof File) {
      const reader = new FileReader();

      reader.addEventListener('load', e => {
        const result = e.target?.result;
        if (!result) {
          return setError(
            'There was an error while uploading a setup, try again later'
          );
        }

        const data = JSON.parse(result as string) as Record<string, unknown>;
        // cut .json part off
        const name = setupFile.name.slice(0, setupFile.name.length - 5);

        editSetup({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          id: setup!.id,
          car: values.car,
          track: values.track,
          data,
          name,
        });
      });

      reader.readAsText(setupFile);
    }

    editSetup({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: setup!.id,
      car: values.car,
      track: values.track,
    });
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
        <PopupHeader close={close} title={`Edit ${setup?.name ?? 'setup'}`} />
      }
    >
      <Form onSubmit={e => handleSubmit(e, formState)}>
        <Label label='Car' optional>
          <Input
            onChange={e =>
              setFormState(prev => ({ ...prev, car: e.target.value }))
            }
            value={formState.car}
            error={errors?.car}
          />
        </Label>
        <Label label='Track' optional>
          <Input
            onChange={e =>
              setFormState(prev => ({ ...prev, track: e.target.value }))
            }
            value={formState.track}
            error={errors?.track}
          />
        </Label>
        <Label label='Upload a setup' optional>
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

export default EditSetup;
