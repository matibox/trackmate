import { useState, type FC, useEffect } from 'react';
import Popup, { PopupHeader } from '~/components/common/Popup';
import { useEditRosterStore } from '../store';
import { type RouterOutputs, api } from '~/utils/api';
import { useError } from '~/hooks/useError';
import Loading from '@ui/Loading';
import Button from '@ui/Button';

type Driver = RouterOutputs['championship']['driversToAdd'][number] & {
  roster: 'champ' | 'team';
};

const EditRoster: FC = () => {
  const { close, isOpened, championship } = useEditRosterStore();

  const [champRoster, setChampRoster] = useState<Driver[]>([]);
  const [teamRoster, setTeamRoster] = useState<Driver[]>([]);

  useEffect(() => {
    if (!championship?.roster) return;
    setChampRoster(
      championship.roster.map(driver => ({ ...driver, roster: 'champ' }))
    );
  }, [championship?.roster]);

  const utils = api.useContext();
  const { Error, setError } = useError();

  const { data: driversToAdd, isLoading: driversToAddLoading } =
    api.championship.driversToAdd.useQuery(
      { championshipId: championship?.id },
      {
        onError: err => setError(err.message),
        onSuccess: data =>
          setTeamRoster(data.map(driver => ({ ...driver, roster: 'team' }))),
        enabled: Boolean(championship?.id),
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      }
    );

  const { mutate: editRoster, isLoading: editRosterLoading } =
    api.championship.editRoster.useMutation({
      onError: err => setError(err.message),
      onSuccess: async () => {
        await utils.invalidate();
        close();
      },
    });

  function changeRoster(driver: Driver) {
    if (driver.roster === 'team') {
      setTeamRoster(prev => prev.filter(d => d.id !== driver.id));
      setChampRoster(prev => [...prev, { ...driver, roster: 'champ' }]);
    } else {
      setChampRoster(prev => prev.filter(d => d.id !== driver.id));
      setTeamRoster(prev => [...prev, { ...driver, roster: 'team' }]);
    }
  }

  return (
    <Popup
      condition={isOpened}
      close={close}
      header={
        <PopupHeader
          close={close}
          title={
            championship
              ? `Edit roster for ${championship.title}`
              : 'Edit roster'
          }
        />
      }
      isLoading={editRosterLoading}
    >
      <div className='flex flex-col gap-4'>
        <span className='text-slate-300'>
          Click on a driver to move him in or out from the roster
        </span>
        <div className='flex flex-col gap-2'>
          <h2 className='text-lg font-semibold'>Roster</h2>
          {championship ? (
            <>
              {champRoster.length === 0 ? (
                <span className='text-slate-300'>
                  There are no drivers in the roster.
                </span>
              ) : (
                <div className='grid max-h-48 grid-cols-1 gap-2 overflow-y-scroll p-0.5 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-sky-500 hover:scrollbar-thumb-sky-400 sm:grid-cols-2'>
                  {champRoster.map(driver => (
                    <Button
                      key={driver.id}
                      intent='secondary'
                      size='small'
                      className='text-base'
                      onClick={() => changeRoster(driver)}
                    >
                      {driver.name}
                    </Button>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
        <div className='flex flex-col gap-2'>
          <h2 className='text-lg font-semibold'>Team drivers</h2>
          {driversToAddLoading ? <Loading /> : null}
          {driversToAdd && teamRoster ? (
            <>
              {teamRoster.length === 0 ? (
                <span className='text-slate-300'>
                  There are no drivers in the roster.
                </span>
              ) : (
                <div className='grid max-h-48 grid-cols-1 gap-2 overflow-y-scroll p-0.5 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-sky-500 hover:scrollbar-thumb-sky-400 sm:grid-cols-2'>
                  {teamRoster.map(driver => (
                    <Button
                      key={driver.id}
                      intent='secondary'
                      size='small'
                      className='text-base'
                      onClick={() => changeRoster(driver)}
                    >
                      {driver.name}
                    </Button>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
        {championship ? (
          <Button
            intent='primary'
            size='small'
            className='self-end'
            onClick={() =>
              editRoster({
                championshipId: championship.id,
                drivers: champRoster.map(driver => ({
                  id: driver.id,
                })),
              })
            }
          >
            Save
          </Button>
        ) : null}
        <Error />
      </div>
    </Popup>
  );
};

export default EditRoster;
