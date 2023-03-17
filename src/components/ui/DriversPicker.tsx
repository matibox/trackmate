import { Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { type EventType } from '@prisma/client';
import { type FC } from 'react';
import cn from '../../lib/classes';
import { api, type RouterOutputs } from '../../utils/api';
import ErrorWrapper from '../ErrorWrapper';
import Label from './Label';
import Loading from './Loading';

type DriversPickerProps = {
  formState: {
    type: EventType | null;
    teammates?:
      | NonNullable<RouterOutputs['team']['getDriveFor']>['drivers']
      | undefined
      | null;
  };
  setTeammates: (
    teammates: DriversPickerProps['formState']['teammates']
  ) => void;
  errors:
    | {
        teammates?: string[] | undefined;
      }
    | undefined;
};

const DriversPicker: FC<DriversPickerProps> = ({
  formState,
  setTeammates,
  errors,
}) => {
  const { data: teammates, isLoading } =
    api.team.getTeammatesOrDrivers.useQuery();

  return (
    <>
      {formState.type === 'endurance' && (
        <Label label='drivers' className='relative'>
          <ErrorWrapper error={errors?.teammates}>
            <Listbox
              value={formState.teammates}
              onChange={teammates => setTeammates(teammates)}
              multiple
              by='id'
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
              <Listbox.Options
                className={cn(
                  'absolute top-16 mt-1 max-h-60 w-full overflow-auto rounded bg-slate-50 py-1 text-base focus:outline-none sm:text-sm',
                  {
                    'grid place-items-center': isLoading,
                  }
                )}
              >
                {!isLoading ? (
                  teammates?.map(teammate => (
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
                  ))
                ) : (
                  <Loading />
                )}
              </Listbox.Options>
            </Listbox>
          </ErrorWrapper>
        </Label>
      )}
    </>
  );
};

export default DriversPicker;
