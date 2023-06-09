import { UserMinusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { type FC } from 'react';
import { api, type RouterOutputs } from '../../../utils/api';
import { useError } from '~/hooks/useError';

type ManagerProps = {
  manager: NonNullable<
    RouterOutputs['team']['getManagingFor']
  >['managers'][number];
  teamId: string;
};

const Manager: FC<ManagerProps> = ({ manager, teamId }) => {
  const { Error, setError } = useError();
  const utils = api.useContext();

  const { mutate: removeManager, isLoading } =
    api.team.removeManager.useMutation({
      onError: err => setError(err.message),
      onSuccess: async () => {
        await utils.invalidate();
      },
    });

  return (
    <li className='flex justify-between border-y border-slate-700 py-2 first:border-t-0 last:border-b-0'>
      <Link
        draggable={false}
        href={`/profile/${manager.id}`}
        className='transition-colors hover:text-sky-400'
      >
        {manager.name}
      </Link>
      <button
        onClick={() => removeManager({ teamId, managerId: manager.id })}
        disabled={isLoading}
      >
        <UserMinusIcon className='h-5 text-slate-50 transition-colors hover:text-red-500' />
      </button>
      <Error />
    </li>
  );
};

export default Manager;
