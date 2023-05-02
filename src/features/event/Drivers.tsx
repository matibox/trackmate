import { UsersIcon } from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/20/solid';
import Button from '@ui/Button';
import Tile from '@ui/Tile';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useMemo, type FC, useState } from 'react';
import Avatar from '~/components/common/Avatar';
import { type Event } from '~/pages/event/[eventId]';
import { type RouterOutputs, api } from '~/utils/api';
import { useError } from '~/hooks/useError';
import Loading from '@ui/Loading';

type DriversToAdd = RouterOutputs['team']['getTeammatesOrDrivers'];

const Drivers: FC<{ event: Event }> = ({ event }) => {
  const { data: session } = useSession();

  const canManageDrivers = useMemo(() => {
    if (event.result) return false;
    return (
      event.managerId === session?.user?.id ||
      event.drivers.some(driver => driver.id === session?.user?.id)
    );
  }, [event.drivers, event.managerId, event.result, session?.user?.id]);

  const [isEditing, setIsEditing] = useState(false);
  const [driversToAdd, setDriversToAdd] = useState<DriversToAdd>([]);

  const { Error, setError } = useError();
  const utils = api.useContext();

  const { isLoading: driversToAddLoading } =
    api.team.getTeammatesOrDrivers.useQuery(undefined, {
      onError: err => setError(err.message),
      onSuccess: data => {
        const drivers = data.filter(
          driver => !event.drivers.some(d => d.id === driver.id)
        );
        setDriversToAdd(drivers);
      },
      enabled: isEditing,
    });

  const { mutate: editDrivers, isLoading: editDriversLoading } =
    api.event.edit.useMutation({
      onError: err => setError(err.message),
      onSuccess: async () => {
        await utils.event.single.invalidate();
        await utils.team.getTeammatesOrDrivers.invalidate();
      },
    });

  return (
    <div className='flex flex-col gap-4'>
      <div className='grid grow grid-cols-[repeat(auto-fill,_10rem)] justify-center gap-4 sm:flex sm:flex-wrap sm:justify-start'>
        {event.drivers.map(driver => (
          <Tile
            key={driver.id}
            className='w-40 sm:w-60'
            isLoading={editDriversLoading}
          >
            {isEditing && driver.id !== session?.user?.id ? (
              <Button
                intent='subtleDanger'
                size='xs'
                gap='small'
                className='absolute top-2 right-2 h-7 p-1'
                aria-label='Delete driver'
                onClick={() =>
                  editDrivers({
                    id: event.id,
                    type: event.type,
                    drivers: [...event.drivers].filter(d => d.id !== driver.id),
                  })
                }
              >
                <TrashIcon className='h-4' />
              </Button>
            ) : null}
            <DriverImage driver={driver} />
          </Tile>
        ))}
      </div>
      {canManageDrivers ? (
        <div className='flex w-full flex-wrap gap-2 sm:w-44 sm:flex-col sm:flex-nowrap'>
          <Button
            intent='primary'
            size='small'
            gap={isEditing ? 'small' : 'normal'}
            onClick={() => setIsEditing(prev => !prev)}
          >
            <span>{isEditing ? 'Finish' : 'Manage drivers'}</span>
            {isEditing ? (
              <CheckCircleIcon className='h-5' />
            ) : (
              <UsersIcon className='h-5' />
            )}
          </Button>
        </div>
      ) : null}
      {isEditing ? (
        <>
          {driversToAddLoading ? (
            <Loading />
          ) : (
            <>
              <h2 className='text-xl font-semibold'>Drivers to add</h2>
              <div className='grid grow grid-cols-[repeat(auto-fill,_10rem)] justify-center gap-4 sm:flex sm:flex-wrap sm:justify-start'>
                {driversToAdd.length === 0 ? (
                  <span className='text-slate-300'>
                    There are no drivers to add
                  </span>
                ) : null}
                {driversToAdd.map(driver => (
                  <Tile
                    key={driver.id}
                    className='w-40 sm:w-60'
                    isLoading={editDriversLoading}
                  >
                    <Button
                      intent='primary'
                      size='xs'
                      gap='small'
                      className='absolute top-2 right-2 h-7 p-1'
                      aria-label='Add driver'
                      onClick={() =>
                        editDrivers({
                          id: event.id,
                          type: event.type,
                          drivers: [...event.drivers, driver],
                        })
                      }
                    >
                      <PlusIcon className='h-5' />
                    </Button>
                    <DriverImage driver={driver} />
                  </Tile>
                ))}
              </div>
            </>
          )}
        </>
      ) : null}
      <Error />
    </div>
  );
};

const DriverImage: FC<{ driver: Event['drivers'][number] }> = ({ driver }) => {
  return (
    <div className='flex flex-col items-center justify-center'>
      <Avatar
        height={96}
        width={96}
        src={driver.image ?? ''}
        alt={`${driver.name ?? 'driver'}'s profile picture`}
        priority={true}
        className='mb-2 flex h-20 w-20 items-center justify-center rounded-full text-center text-sm ring-1 ring-slate-700 sm:h-24 sm:w-24'
      />
      <Link
        href={`/profile/${driver.id}`}
        className='font-semibold transition-colors hover:text-sky-400'
      >
        <p className='text-center leading-5'>{driver.name}</p>
      </Link>
      {driver.team && (
        <Link href={`/team/${driver.team.id}`}>
          <span className='text-sm text-slate-400 underline decoration-slate-500/0 transition hover:decoration-slate-500 sm:text-base'>
            {driver.team.name}
          </span>
        </Link>
      )}
    </div>
  );
};

export default Drivers;
