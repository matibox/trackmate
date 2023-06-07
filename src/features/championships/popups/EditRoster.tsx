import { type FC } from 'react';
import Popup, { PopupHeader } from '~/components/common/Popup';
import { useEditRosterStore } from '../store';
import { type RouterOutputs, api } from '~/utils/api';
import { useError } from '~/hooks/useError';
import Loading from '@ui/Loading';

const EditRoster: FC = () => {
  const { close, isOpened, championship } = useEditRosterStore();

  const { Error, setError } = useError();

  const { data: driversToAdd, isLoading: driversToAddLoading } =
    api.championship.driversToAdd.useQuery(
      { championshipId: championship?.id },
      {
        onError: err => setError(err.message),
        enabled: Boolean(championship?.id),
      }
    );

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
    >
      <div className='flex flex-col gap-4'>
        <span className='text-slate-300'>
          Drag and drop drivers to move them from one roster to another
        </span>
        <div className='flex flex-col gap-2'>
          <h2 className='text-lg font-semibold'>Roster</h2>
          {championship ? (
            <>
              {championship.roster.length === 0 ? (
                <span className='text-slate-300'>
                  There are no drivers in the roster.
                </span>
              ) : (
                <div className='grid grid-cols-2 gap-2'>
                  {championship.roster.map(driver => (
                    <Driver key={driver.id} driver={driver} />
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
        <div className='flex flex-col gap-2'>
          <h2 className='text-lg font-semibold'>Team drivers</h2>
          {driversToAddLoading ? <Loading /> : null}
          {driversToAdd ? (
            <>
              {driversToAdd.length === 0 ? (
                <span className='text-slate-300'>
                  There are no drivers in the roster.
                </span>
              ) : (
                <div className='grid grid-cols-2 gap-2'>
                  {driversToAdd.map(driver => (
                    <Driver key={driver.id} driver={driver} />
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
        <Error />
      </div>
    </Popup>
  );
};

const Driver: FC<{
  driver: RouterOutputs['championship']['driversToAdd'][number];
}> = ({ driver }) => {
  return (
    <div className='w-full gap-2 rounded py-2 px-3 ring-1 ring-slate-700'>
      {driver.name}
    </div>
  );
};

export default EditRoster;
