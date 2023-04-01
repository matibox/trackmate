import { Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import Input from '@ui/Input';
import Label from '@ui/Label';
import Loading from '@ui/Loading';
import { useSession } from 'next-auth/react';
import { type FC } from 'react';
import cn from '../../../lib/classes';
import { useCalendarStore } from '../../../store/useCalendarStore';
import { api, type RouterOutputs } from '../../../utils/api';
import { capitilize, hasRole } from '../../../utils/helpers';
import ErrorWrapper from '../../ErrorWrapper';
import type { EditEventErrors } from './EditEvent';
import type { NewEventErrors, NewEventFormState } from './NewEvent';

type ChampEventDetailsProps = {
  formState: NewEventFormState;
  setFormState: (formState: Partial<NewEventFormState>) => void;
  errors: NewEventErrors | EditEventErrors;
};

const ChampEventDetails: FC<ChampEventDetailsProps> = ({
  formState,
  setFormState,
  errors,
}) => {
  const { data: session } = useSession();
  const { selectedDay } = useCalendarStore();

  const { data: driverChamps, isInitialLoading: driverChampsLoading } =
    api.championship.listDriverChamps.useQuery(undefined, {
      enabled: Boolean(hasRole(session, 'driver')),
    });
  const { data: managingChamps, isInitialLoading: managingChampsLoading } =
    api.championship.listManagingChamps.useQuery(undefined, {
      enabled: Boolean(hasRole(session, 'manager')),
    });

  return (
    <>
      <Label label='championship' className='relative'>
        <ErrorWrapper error={errors?.championship}>
          <Listbox
            value={formState.championship}
            onChange={championship =>
              setFormState({
                championship,
                car: championship?.car ?? '',
                type: championship?.type,
              })
            }
          >
            <Listbox.Button className='relative h-8 cursor-default rounded bg-slate-50 pl-2 text-left text-slate-900 focus:outline-none focus-visible:ring focus-visible:ring-sky-600 sm:text-sm'>
              <span>
                {formState.championship?.organizer} -{' '}
                {formState.championship?.name}
              </span>
              <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                <ChevronUpDownIcon
                  className='h-5 w-5 text-slate-900'
                  aria-hidden='true'
                />
              </span>
            </Listbox.Button>
            <Listbox.Options
              className={cn(
                'absolute top-16 mt-1 max-h-60 w-full overflow-auto rounded bg-slate-50 py-1 text-base focus:outline-none sm:text-sm',
                {
                  'grid place-items-center':
                    driverChampsLoading || managingChampsLoading,
                }
              )}
            >
              {!driverChampsLoading && !managingChampsLoading ? (
                driverChamps &&
                managingChamps &&
                driverChamps.length > 0 &&
                managingChamps.length > 0 ? (
                  [
                    ...new Map(
                      [...driverChamps, ...managingChamps].map(item => [
                        item.id,
                        item,
                      ])
                    ).values(),
                  ].map(championship => (
                    <ChampionshipOption
                      key={championship.id}
                      championship={championship}
                    />
                  ))
                ) : driverChamps && driverChamps.length > 0 ? (
                  driverChamps.map(championship => (
                    <ChampionshipOption
                      key={championship.id}
                      championship={championship}
                    />
                  ))
                ) : managingChamps && managingChamps.length > 0 ? (
                  managingChamps.map(championship => (
                    <ChampionshipOption
                      key={championship.id}
                      championship={championship}
                    />
                  ))
                ) : (
                  <span className='pl-4 text-base text-slate-900'>
                    No championships found
                  </span>
                )
              ) : (
                <Loading />
              )}
            </Listbox.Options>
          </Listbox>
        </ErrorWrapper>
      </Label>

      {formState.championship && (
        <>
          <Label label='title'>
            <Input
              error={errors?.title}
              value={formState.title}
              onChange={e => setFormState({ title: e.target.value })}
            />
          </Label>
          <Label label='car'>
            <Input
              error={errors?.car}
              value={formState.car}
              onChange={e => setFormState({ car: e.target.value })}
            />
          </Label>
          <Label label='track'>
            <Input
              error={errors?.track}
              value={formState.track}
              onChange={e => setFormState({ track: e.target.value })}
            />
          </Label>
          <Label label='duration in minutes'>
            <Input
              type='number'
              min={0}
              error={errors?.duration}
              value={formState.duration.toString()}
              onChange={e => setFormState({ duration: e.target.valueAsNumber })}
            />
          </Label>
          <Label label='starting time'>
            <Input
              type='time'
              value={formState.time ?? '00:00'}
              onChange={e => setFormState({ time: e.target.value })}
              error={errors?.time}
            />
          </Label>

          {formState.type === 'endurance' && (
            <Label label='drivers' className='relative'>
              <ErrorWrapper error={errors?.drivers}>
                <Listbox
                  value={formState.drivers}
                  onChange={drivers => setFormState({ drivers })}
                  by='id'
                  multiple
                >
                  <Listbox.Button className='relative h-8 cursor-default rounded bg-slate-50 pl-2 text-left text-slate-900 focus:outline-none focus-visible:ring focus-visible:ring-sky-600 sm:text-sm'>
                    <span>
                      {formState.drivers
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
                  <Listbox.Options className='absolute top-16 mt-1 max-h-60 w-full overflow-auto rounded bg-slate-50 py-1 text-base focus:outline-none sm:text-sm'>
                    {formState.championship.drivers.map(driver => (
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
          <div className='flex w-full flex-wrap gap-16'>
            <div className='flex flex-col'>
              <span className='text-slate-300'>Type</span>
              <span>{capitilize(formState.championship.type)}</span>
            </div>
            <div className='flex flex-col'>
              <span className='text-slate-300'>Date</span>
              <span>{selectedDay.format('DD MMM YYYY')}</span>
            </div>
          </div>
        </>
      )}
    </>
  );
};

const ChampionshipOption: FC<{
  championship: RouterOutputs['championship']['listDriverChamps'][number];
}> = ({ championship }) => {
  return (
    <Listbox.Option
      key={championship.id}
      value={championship}
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
            {championship.organizer} - {championship.name}
          </span>
          {selected && (
            <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-slate-900'>
              <CheckIcon className='h-5 w-5' aria-hidden='true' />
            </span>
          )}
        </>
      )}
    </Listbox.Option>
  );
};

export default ChampEventDetails;
