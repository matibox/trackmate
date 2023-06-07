import { useState, type FC, useEffect, type DragEvent } from 'react';
import Popup, { PopupHeader } from '~/components/common/Popup';
import { useEditRosterStore } from '../store';
import { type RouterOutputs, api } from '~/utils/api';
import { useError } from '~/hooks/useError';
import Loading from '@ui/Loading';
import { polyfill } from 'mobile-drag-drop';
import Button from '@ui/Button';

type Driver = RouterOutputs['championship']['driversToAdd'][number] & {
  roster: 'champ' | 'team';
};

const EditRoster: FC = () => {
  const { close, isOpened, championship } = useEditRosterStore();

  const [champRoster, setChampRoster] = useState<Driver[]>([]);
  const [teamRoster, setTeamRoster] = useState<Driver[]>([]);

  useEffect(() => {
    polyfill();
  }, []);

  useEffect(() => {
    if (!championship?.roster) return;
    setChampRoster(
      championship.roster.map(driver => ({ ...driver, roster: 'champ' }))
    );
  }, [championship?.roster]);

  const utils = api.useContext();
  const { Error, setError } = useError();

  const { isLoading: driversToAddLoading } =
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

  function handleOnDrag(e: DragEvent, driver: Driver) {
    e.dataTransfer.setData('driver', JSON.stringify(driver));
  }

  function handleOnDrop(e: DragEvent) {
    const driver = JSON.parse(e.dataTransfer.getData('driver')) as Driver;
    const target = e.target as HTMLElement;

    if (driver.roster === 'team') {
      if (target.dataset.roster !== 'champ') return;
      setTeamRoster(prev => prev.filter(d => d.id !== driver.id));
      setChampRoster(prev => [...prev, { ...driver, roster: 'champ' }]);
    } else {
      if (target.dataset.roster !== 'team') return;
      setChampRoster(prev => prev.filter(d => d.id !== driver.id));
      setTeamRoster(prev => [...prev, { ...driver, roster: 'team' }]);
    }
  }

  function handleOnDragEnter(e: DragEvent) {
    e.preventDefault();
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
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
          Drag and drop drivers to move them from one roster to another
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
                <div
                  className='grid grid-cols-1 gap-2 sm:grid-cols-2'
                  onDrop={handleOnDrop}
                  onDragEnter={handleOnDragEnter}
                  onDragOver={handleDragOver}
                  data-roster='champ'
                >
                  {champRoster.map(driver => (
                    <div
                      key={driver.id}
                      className='w-full cursor-grab gap-2 rounded py-2 px-3 ring-1 ring-slate-700'
                      draggable
                      onDragStart={e => handleOnDrag(e, driver)}
                      data-roster='champ'
                    >
                      {driver.name}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
        <div className='flex flex-col gap-2'>
          <h2 className='text-lg font-semibold'>Team drivers</h2>
          {driversToAddLoading ? <Loading /> : null}
          {teamRoster ? (
            <>
              {teamRoster.length === 0 ? (
                <span className='text-slate-300'>
                  There are no drivers in the roster.
                </span>
              ) : (
                <div
                  className='grid grid-cols-1 gap-2 sm:grid-cols-2'
                  onDrop={handleOnDrop}
                  onDragEnter={handleOnDragEnter}
                  onDragOver={handleDragOver}
                  data-roster='team'
                >
                  {teamRoster.map(driver => (
                    <div
                      key={driver.id}
                      className='w-full cursor-grab gap-2 rounded py-2 px-3 ring-1 ring-slate-700'
                      draggable
                      onDragStart={e => handleOnDrag(e, driver)}
                      data-roster='team'
                    >
                      {driver.name}
                    </div>
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
