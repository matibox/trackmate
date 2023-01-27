import { Combobox } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/20/solid';
import Button from '@ui/Button';
import Form from '@ui/Form';
import Input from '@ui/Input';
import Label from '@ui/Label';
import Loading from '@ui/Loading';
import Popup from '@ui/Popup';
import PopupHeader from '@ui/PopupHeader';
import { useState, type FC } from 'react';
import { z } from 'zod';
import useDebounce from '../../../hooks/useDebounce';
import useForm from '../../../hooks/useForm';
import cn from '../../../lib/classes';
import { useCreateTeamStore } from '../../../store/useCreateTeamStore';
import { api } from '../../../utils/api';
import ErrorWrapper from '../../ErrorWrapper';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  drivers: z
    .array(z.object({ id: z.string(), name: z.string() }))
    .min(1, 'Drivers are required'),
});

const CreateTeam: FC = () => {
  const { close, isOpened } = useCreateTeamStore();
  const [formState, setFormState] = useState<z.infer<typeof formSchema>>({
    name: '',
    drivers: [],
  });

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  const { errors, handleSubmit } = useForm(formSchema, values => {
    createTeam(values);
  });

  const utils = api.useContext();
  const { data: drivers, isLoading } = api.user.getDrivers.useQuery(
    {
      q: debouncedQuery,
    },
    {
      enabled: Boolean(debouncedQuery),
    }
  );
  const { mutate: createTeam, isLoading: submitLoading } =
    api.team.create.useMutation({
      onSuccess: async () => {
        await utils.team.getDriveFor.invalidate();
        await utils.team.getManagingFor.invalidate();
        close();
      },
    });

  return (
    <Popup
      close={close}
      condition={isOpened}
      header={<PopupHeader close={close} title='create team' />}
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
        <Label
          label={`drivers: ${formState.drivers
            .map(driver => driver.name)
            .join(', ')}`}
          className='relative'
        >
          <ErrorWrapper error={errors?.drivers}>
            <Combobox
              value={formState.drivers}
              onChange={drivers =>
                setFormState(prev => ({
                  ...prev,
                  drivers: [
                    ...new Map(
                      drivers.map(v => [JSON.stringify([v.id, v.name]), v])
                    ).values(),
                  ],
                }))
              }
              multiple
            >
              <Combobox.Input
                className='relative h-8 cursor-default rounded bg-slate-50 pl-2 text-left text-slate-900 selection:bg-sky-500 selection:text-slate-50 focus:outline-none focus-visible:ring focus-visible:ring-sky-600 sm:text-sm'
                onChange={e => setQuery(e.target.value)}
              />
              <Combobox.Options className='absolute top-16 mt-1 max-h-60 min-h-[2.5rem] w-full overflow-auto rounded bg-slate-50 py-1 text-base focus:outline-none sm:text-sm'>
                {!isLoading && drivers?.length === 0 && query !== '' ? (
                  <div className='relative cursor-default select-none py-2 px-4 text-gray-700'>
                    No drivers found.
                  </div>
                ) : (
                  <>
                    {drivers?.map(driver => (
                      <Combobox.Option
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
                                <CheckIcon
                                  className='h-5 w-5'
                                  aria-hidden='true'
                                />
                              </span>
                            )}
                          </>
                        )}
                      </Combobox.Option>
                    ))}
                  </>
                )}

                {isLoading && (
                  <div className='absolute top-0 left-0 grid h-full w-full place-items-center rounded bg-slate-900'>
                    <Loading />
                  </div>
                )}
              </Combobox.Options>
            </Combobox>
          </ErrorWrapper>
        </Label>
        <Button
          intent='primary'
          className='ml-auto mt-2 h-8 self-end'
          disabled={submitLoading}
        >
          <span>Submit</span>
          {submitLoading && <Loading />}
        </Button>
      </Form>
    </Popup>
  );
};

export default CreateTeam;
