import Button from '@ui/Button';
import DriversPicker from '@ui/DriversPicker';
import EventTypePicker from '@ui/EventTypePicker';
import Form from '@ui/Form';
import Input from '@ui/Input';
import Label from '@ui/Label';
import Popup from '@ui/Popup';
import PopupHeader from '@ui/PopupHeader';
import { useSession } from 'next-auth/react';
import { useState, type FC } from 'react';
import { z } from 'zod';
import useForm from '../../../hooks/useForm';
import { useChampionshipStore } from '../../../store/useChampionshipStore';
import { api } from '../../../utils/api';

const NewChampionship: FC = () => {
  const {
    createChampionshipPopup: { close, isOpened },
  } = useChampionshipStore();
  const { data: session } = useSession();

  const formSchema = z
    .object({
      organizer: z.string().min(1, 'Organizer is required'),
      link: z.string().min(1, 'URL is required').url('Not a valid URL'),
      car: z.string().optional(),
      type: z.union([z.literal('sprint'), z.literal('endurance')]),
      teammates: z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
          })
        )
        .optional(),
    })
    .superRefine(({ type, teammates }, ctx) => {
      if ((type === 'endurance' && teammates?.length === 0) || !teammates) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 1,
          inclusive: true,
          type: 'array',
          message: 'Drivers are required',
          path: ['teammates'],
        });
      }
      const me = teammates?.find(driver => driver.id === session?.user?.id);
      if (!me) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['teammates'],
          message: 'You need to be in the roster',
        });
      }
    });

  const utils = api.useContext();
  const { mutate: createChampionship, isLoading } =
    api.championship.create.useMutation({
      onSuccess: async () => {
        //TODO invalidate specific query
        await utils.championship.invalidate();
        close();
      },
    });

  const [formState, setFormState] = useState<z.infer<typeof formSchema>>({
    organizer: '',
    link: '',
    car: '',
    type: 'sprint',
    teammates: [],
  });
  const { handleSubmit, errors } = useForm(formSchema, values => {
    createChampionship(values);
  });

  return (
    <Popup
      header={<PopupHeader close={close} title='New championship' />}
      close={close}
      condition={isOpened}
      isLoading={isLoading}
    >
      <Form onSubmit={e => handleSubmit(e, formState)}>
        <Label label='organizer'>
          <Input
            type='text'
            value={formState.organizer}
            onChange={e =>
              setFormState(prev => ({ ...prev, organizer: e.target.value }))
            }
            error={errors?.organizer}
          />
        </Label>
        <Label label='championship link'>
          <Input
            type='text'
            value={formState.link}
            onChange={e =>
              setFormState(prev => ({ ...prev, link: e.target.value }))
            }
            error={errors?.link}
          />
        </Label>
        <Label label='championship car' optional>
          <Input
            type='text'
            value={formState.car}
            onChange={e =>
              setFormState(prev => ({ ...prev, car: e.target.value }))
            }
            error={errors?.car}
          />
        </Label>
        <EventTypePicker
          formState={formState}
          setType={type => setFormState(prev => ({ ...prev, type }))}
        />
        <DriversPicker
          formState={formState}
          setTeammates={teammates =>
            setFormState(prev => ({
              ...prev,
              teammates: teammates as
                | {
                    id: string;
                    name: string;
                  }[]
                | undefined,
            }))
          }
          errors={errors}
        />
        <Button intent='primary' className='ml-auto mt-2 h-8 self-end'>
          Submit
        </Button>
      </Form>
    </Popup>
  );
};

export default NewChampionship;
