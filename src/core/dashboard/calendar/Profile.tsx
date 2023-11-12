import { Share2Icon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/Avatar';
import { Button } from '~/components/ui/Button';
import { Skeleton } from '~/components/ui/Skeleton';
import { capitalize } from '~/lib/utils';
import { api } from '~/utils/api';

export default function Profile() {
  const { data: session, status } = useSession();

  const { data: users, isLoading } = api.user.byId.useQuery(
    { memberIds: [session?.user.id as string] },
    { enabled: status === 'authenticated', refetchOnWindowFocus: false }
  );

  const user = useMemo(() => {
    if (!users) return null;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return users[0]!;
  }, [users]);

  return (
    <section className='flex w-full max-w-lg items-center justify-between rounded-md border border-slate-800 bg-slate-900 px-4 py-2 md:sticky md:left-0 md:top-4 2xl:static'>
      {user && !isLoading ? (
        <div className='flex gap-3'>
          <Avatar>
            <AvatarImage
              src={user.image ?? ''}
              alt={`@${user.username ?? ''}`}
            />
            <AvatarFallback>
              {user.firstName?.charAt(0).toUpperCase()}
              {user.lastName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col justify-center gap-0.5'>
            <span className='font-medium !leading-none lg:text-lg'>
              {capitalize(user.firstName ?? '')}{' '}
              {capitalize(user.lastName ?? '')}
            </span>
            <span className='text-sm !leading-none text-slate-400'>
              {`@${user.username ?? ''}`}
            </span>
          </div>
        </div>
      ) : (
        <div className='flex gap-3'>
          <Skeleton className='h-10 w-10 rounded-full' />
          <div className='flex flex-col justify-center gap-1'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-3 w-20' />
          </div>
        </div>
      )}
      <Button
        variant='outline'
        size='icon'
        aria-label='Share calendar'
        disabled
      >
        <Share2Icon className='h-5 w-5' />
      </Button>
    </section>
  );
}
