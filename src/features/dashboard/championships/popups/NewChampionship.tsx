import Button from '@ui/Button';
import DriversPicker from '~/components/common/DriversPicker';
import EventTypePicker from '~/components/common/EventTypePicker';
import Form from '@ui/Form';
import Input from '@ui/Input';
import Label from '@ui/Label';
import Popup, { PopupHeader } from '~/components/common/Popup';
import { useSession } from 'next-auth/react';
import { useState, type FC } from 'react';
import { z } from 'zod';
import { eventTypes } from '~/constants/constants';
import useForm from '~/hooks/useForm';
import { api } from '~/utils/api';
import { hasRole } from '~/utils/helpers';
import { useChampionshipStore } from '../store';

const NewChampionship: FC = () => {
  const {
    create: { close, isOpened },
  } = useChampionshipStore();
  const { data: session } = useSession();

  const formSchema = z
    .object({
      organizer: z.string().min(1, 'Organizer is required'),
      link: z.string().min(1, 'URL is required').url('Not a valid URL'),
      name: z.string().min(1, 'Name is required'),
      car: z.string().nullable(),
      type: z.enum(eventTypes),
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
      if (
        (type === 'endurance' && teammates && teammates?.length < 2) ||
        !teammates
      ) {
      }

      if (type === 'endurance' && teammates && !hasRole(session, 'manager')) {
        const user = teammates.find(u => u.id === session?.user?.id);
        if (!user) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'You have to be in a roster',
            path: ['teammates'],
          });
        }
      }
    });

  const initialFormState: z.infer<typeof formSchema> = {
    organizer: '',
    link: '',
    name: '',
    car: '',
    type: 'sprint',
    teammates: [],
  };

  const utils = api.useContext();
  const { mutate: createChampionship, isLoading } =
    api.championship.create.useMutation({
      onSuccess: async () => {
        await utils.championship.get.invalidate();
        setFormState(initialFormState);
        close();
      },
    });

  const [formState, setFormState] =
    useState<typeof initialFormState>(initialFormState);
  const { handleSubmit, errors } = useForm(formSchema, values => {
    createChampionship({
      ...values,
      teammates:
        values.teammates?.length === 0 && values.type === 'sprint'
          ? [
              {
                id: session?.user?.id as string,
                name: session?.user?.name as string,
              },
            ]
          : values.teammates,
    });
  });

  return (
    <Popup
      header={<PopupHeader close={close} title='New championship' />}
      close={close}
      condition={isOpened}
      isLoading={isLoading}
    >
      <Form onSubmit={e => handleSubmit(e, formState)}>
        <Label label='name'>
          <Input
            type='text'
            value={formState.name}
            onChange={e =>
              setFormState(prev => ({ ...prev, name: e.target.value }))
            }
            error={errors?.name}
          />
        </Label>
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
            value={formState.car ?? ''}
            onChange={e =>
              setFormState(prev => ({ ...prev, car: e.target.value }))
            }
            error={errors?.car}
          />
        </Label>
        <EventTypePicker
          formState={formState}
          setType={type =>
            setFormState(prev => ({ ...prev, type: type ?? 'sprint' }))
          }
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
