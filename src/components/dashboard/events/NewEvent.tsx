import { Listbox, RadioGroup } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { XMarkIcon } from '@heroicons/react/24/solid';
import Button from '@ui/Button';
import Form from '@ui/Form';
import Input from '@ui/Input';
import Label from '@ui/Label';
import Tile from '@ui/Tile';
import { Fragment, useState, type FC } from 'react';
import { z } from 'zod';
import { placeholderTeammates, raceTypes } from '../../../constants/constants';
import useForm from '../../../hooks/useForm';
import cn from '../../../lib/classes';
import ErrorWrapper from '../../ErrorWrapper';

const formSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    type: z.union([z.literal('sprint'), z.literal('endurance')], {
      required_error: 'Type is required',
    }),
    car: z.string().min(1, 'Car is required'),
    track: z.string().min(1, 'Track is required'),
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
  const [formState, setFormState] = useState<z.infer<typeof formSchema>>({
    car: '',
    title: '',
    track: '',
    type: 'sprint',
    teammates: [],
  });
  const { handleSubmit, errors } = useForm(formSchema, values => {
    console.log(values);
  });

  //TODO fetch and select championships

  return (
    <>
      <div className='fixed top-[var(--navbar-height)] left-0 h-full w-full bg-black/40 backdrop-blur-sm' />
      <Tile
        className='fixed top-1/2 left-1/2 w-[calc(100%_-_2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2'
        header={
          <div className='flex items-center justify-between'>
            <h1 className='text-xl'>New event</h1>
            <Button intent='secondary' size='xs'>
              <XMarkIcon className='h-6' />
            </Button>
          </div>
        }
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
          <Label label='race type' className='grid-rows-[1.5rem,2rem]'>
            <RadioGroup
              value={formState.type}
              onChange={type => setFormState(prev => ({ ...prev, type }))}
              className='flex gap-3'
            >
              {raceTypes.map(type => (
                //TODO disabled if not in a team
                <RadioGroup.Option key={type} value={type} as={Fragment}>
                  {({ checked, disabled }) => (
                    <span
                      className={cn(
                        'h-8 rounded px-3 py-1 ring-1 ring-slate-700',
                        {
                          'ring-sky-500': checked,
                          'text-slate-700': disabled,
                        }
                      )}
                    >
                      {type}
                    </span>
                  )}
                </RadioGroup.Option>
              ))}
            </RadioGroup>
          </Label>
          {formState.type === 'endurance' && (
            <Label label='teammates'>
              <ErrorWrapper error={errors?.teammates}>
                <Listbox
                  value={formState.teammates}
                  onChange={teammates =>
                    setFormState(prev => ({ ...prev, teammates }))
                  }
                  multiple
                >
                  <Listbox.Button className='relative h-8 cursor-default rounded bg-slate-50 pl-2 text-left text-slate-900 focus:outline-none focus-visible:ring focus-visible:ring-sky-600 sm:text-sm'>
                    <span>
                      {formState.teammates
                        ?.map(teammate => teammate.name)
                        .join(', ')}
                    </span>
                    <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                      <ChevronUpDownIcon
                        className='h-5 w-5 text-slate-900'
                        aria-hidden='true'
                      />
                    </span>
                  </Listbox.Button>
                  <Listbox.Options className='mt-1 max-h-60 w-full overflow-auto rounded bg-slate-50 py-1 text-base focus:outline-none sm:text-sm'>
                    {placeholderTeammates.map(teammate => (
                      <Listbox.Option
                        key={teammate.id}
                        value={teammate}
                        className={({ active }) =>
                          cn(
                            'relative cursor-default select-none py-2 pl-10 pr-4 text-slate-900',
                            {
                              'bg-sky-500 text-slate-50': active,
                            }
                          )
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? 'font-medium' : 'font-normal'
                              }`}
                            >
                              {teammate.name}
                            </span>
                            {selected && (
                              <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-slate-900'>
                                <CheckIcon
                                  className='h-5 w-5'
                                  aria-hidden='true'
                                />
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Listbox>
              </ErrorWrapper>
            </Label>
          )}
          <Button intent='primary' className='ml-auto h-8 self-end'>
            Submit
          </Button>
        </Form>
      </Tile>
    </>
  );
};

export default NewEvent;
