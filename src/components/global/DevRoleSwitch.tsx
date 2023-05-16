import { useSession } from 'next-auth/react';
import { type FC } from 'react';
import { roles } from '~/constants/constants';
import cn from '~/lib/classes';
import { api } from '~/utils/api';
import { splitAndCapitilize } from '~/utils/helpers';

const DevRoleSwitch: FC<{ disabled?: boolean }> = ({ disabled = false }) => {
  const { data: session } = useSession();
  const dev = process.env.NODE_ENV === 'development';

  const userRoles = session?.user?.roles;

  const { mutate: toggleRole, isLoading } =
    api.user.__devToggleRole.useMutation({
      onSuccess: () => window.location.reload(),
    });

  return !disabled && dev ? (
    <aside className='fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2'>
      {roles.map(role => (
        <button
          key={role}
          onClick={() => toggleRole({ roleName: role })}
          className={cn(
            'border-r border-slate-600 bg-black/80 px-2 py-1 text-slate-300 transition-colors first:rounded-l first:pl-2 last:rounded-r last:border-r-0 last:pr-2 hover:bg-slate-800',
            {
              'text-sky-500': userRoles?.some(r => r.name === role),
              'cursor-not-allowed':
                isLoading ||
                (userRoles?.length === 1 && userRoles[0]?.name === role),
            }
          )}
          disabled={
            isLoading ||
            (userRoles?.length === 1 && userRoles[0]?.name === role)
          }
        >
          {splitAndCapitilize(role)}
        </button>
      ))}
    </aside>
  ) : null;
};

export default DevRoleSwitch;
