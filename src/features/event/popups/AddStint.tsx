import { useState, type FC } from 'react';
import Popup, { PopupHeader } from '~/components/common/Popup';
import { useAddStintStore } from '../store';
import { useError } from '~/hooks/useError';
import { api } from '~/utils/api';
import Form from '@ui/Form';
import useForm from '~/hooks/useForm';
import { z } from 'zod';
import Input from '@ui/Input';
import { useStints } from '../hooks/useStints';
import dayjs from 'dayjs';
import Label from '@ui/Label';
import { Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import cn from '~/lib/classes';
import ErrorWrapper from '~/components/common/ErrorWrapper';
import Button from '@ui/Button';
import { useEventQuery } from '../hooks/useEventQuery';

export const addStintSchema = z.object({
  start: z.date(),
  estimatedEnd: z.date(),
  driver: z.object(
    { id: z.string(), name: z.string().nullable() },
    { invalid_type_error: 'Driver is required' }
  ),
});

type Nullable<T extends object, K extends keyof T> = {
  [P in keyof T]: P extends K ? T[P] | null : T[P];
};

const AddStint: FC = () => {
  const { isOpened, close } = useAddStintStore();
  const { lastStintEndsAt, availableDrivers } = useStints();
  const { id: eventId } = useEventQuery();

  const utils = api.useContext();
  const { Error, setError } = useError();

  const [formState, setFormState] = useState<
    Nullable<z.infer<typeof addStintSchema>, 'driver'>
  >({
    start: lastStintEndsAt,
    driver: null,
    estimatedEnd: lastStintEndsAt,
  });

  const { mutate: addStint, isLoading } = api.stint.add.useMutation({
    onError: err => setError(err.message),
    onSuccess: async () => {
      await utils.invalidate();
      close();
    },
  });

  const { errors, handleSubmit } = useForm(addStintSchema, values => {
    addStint({
      eventId,
      ...values,
    });
  });

  function formatTimeInput(value: string) {
    const [hours, minutes] = value.split(':').map(i => parseInt(i)) as [
      number,
      number
    ];

    return new Date(
      dayjs().year(),
      dayjs().month(),
      dayjs().date(),
      hours,
      minutes
    );
  }

  return (
    <Popup
      close={close}
      condition={isOpened}
      header={<PopupHeader close={close} title='Add stint' />}
      isLoading={isLoading}
    >
      <Form onSubmit={e => handleSubmit(e, formState)}>
        <Label label='Stint start time'>
          <Input
            type='time'
            error={errors?.start}
            value={dayjs(formState?.start).format('HH:mm')}
            onChange={e =>
              setFormState(prev => ({
                ...prev,
                start: formatTimeInput(e.target.value),
              }))
            }
          />
        </Label>
        <Label label='Estimated duration (in minutes)'>
          <Input
            type='number'
            min={0}
            error={errors?.estimatedEnd}
            value={dayjs(formState.estimatedEnd)
              .diff(dayjs(formState.start), 'minutes')
              .toString()}
            onChange={e =>
              setFormState(prev => ({
                ...prev,
                estimatedEnd: dayjs(prev.start)
                  .add(parseInt(e.target.value), 'minutes')
                  .toDate(),
              }))
            }
          />
        </Label>
        <Label label='Driver' className='relative'>
          <ErrorWrapper error={errors?.driver}>
            <Listbox
              value={formState.driver}
              onChange={driver => setFormState(prev => ({ ...prev, driver }))}
            >
              <Listbox.Button className='relative h-8 cursor-default rounded bg-slate-50 pl-2 text-left text-slate-900 focus:outline-none focus-visible:ring focus-visible:ring-sky-600 sm:text-sm'>
                <span>{formState.driver?.name ?? ''}</span>
                <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                  <ChevronUpDownIcon
                    className='h-5 w-5 text-slate-900'
                    aria-hidden='true'
                  />
                </span>
              </Listbox.Button>
              <Listbox.Options className='absolute top-16 mt-1 max-h-60 w-full overflow-auto rounded bg-slate-50 py-1 text-base focus:outline-none sm:text-sm'>
                {availableDrivers.map(driver => (
                  <Listbox.Option
                    key={driver.id}
                    value={driver}
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
                          {driver.name}
                        </span>
                        {selected && (
                          <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-slate-900'>
                            <CheckIcon className='h-5 w-5' aria-hidden='true' />
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
        <Button intent='primary' size='small' gap='small' className='ml-auto'>
          Submit
        </Button>
      </Form>
      <Error />
    </Popup>
  );
};

export default AddStint;
