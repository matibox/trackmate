import Button from '@ui/Button';
import Form from '@ui/Form';
import Input from '@ui/Input';
import Label from '@ui/Label';
import { useState, type FC } from 'react';
import { z } from 'zod';
import { eventTypes } from '../../../constants/constants';
import useForm from '../../../hooks/useForm';
import { useNewEventStore } from '../../../store/useNewEventStore';
import Popup from '@ui/Popup';
import PopupHeader from '@ui/PopupHeader';
import EventTypePicker from '@ui/EventTypePicker';
import DriversPicker from '@ui/DriversPicker';

const formSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    type: z.enum(eventTypes, {
      required_error: 'Type is required',
    }),
    car: z.string().min(1, 'Car is required'),
    track: z.string().min(1, 'Track is required'),
    duration: z.number({ invalid_type_error: 'Duration is required' }),
    championshipId: z.string().optional(),
    managerId: z.string().optional(),
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
        message: 'Teammates are required.',
        path: ['teammates'],
      });
    }
  });

const NewEvent: FC = () => {
  const { close, isOpened } = useNewEventStore();
  const [formState, setFormState] = useState<z.infer<typeof formSchema>>({
    car: '',
    title: '',
    track: '',
    duration: 0,
    type: 'sprint',
    teammates: [],
  });
  const { handleSubmit, errors } = useForm(formSchema, values => {
    console.log(values);
  });

  //TODO fetch and select championships

  return (
    <Popup
      close={close}
      condition={isOpened}
      header={<PopupHeader title='new event' close={close} />}
    >
      <Form onSubmit={e => handleSubmit(e, formState)}>
        <Label label='title'>
          <Input
            type='text'
            value={formState.title}
            onChange={e =>
              setFormState(prev => ({ ...prev, title: e.target.value }))
            }
            error={errors?.title}
          />
        </Label>
        <Label label='car'>
          <Input
            type='text'
            value={formState.car}
            onChange={e =>
              setFormState(prev => ({ ...prev, car: e.target.value }))
            }
            error={errors?.car}
          />
        </Label>
        <Label label='track'>
          <Input
            type='text'
            value={formState.track}
            onChange={e =>
              setFormState(prev => ({ ...prev, track: e.target.value }))
            }
            error={errors?.track}
          />
        </Label>
        <Label label='duration in minutes'>
          <Input
            type='number'
            min={0}
            value={formState.duration.toString()}
            onChange={e =>
              setFormState(prev => ({
                ...prev,
                duration: e.target.valueAsNumber,
              }))
            }
            error={errors?.duration}
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

export default NewEvent;
