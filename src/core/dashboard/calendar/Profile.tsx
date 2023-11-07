import { Share2Icon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/Avatar';
import { Button } from '~/components/ui/Button';
import { capitalize } from '~/lib/utils';

export default function Profile() {
  const { data: session } = useSession();

  return (
    <section className='flex w-full max-w-lg items-center justify-between rounded-md bg-slate-900 px-4 py-2 ring-1 ring-slate-800 md:sticky md:left-0 md:top-4 xl:static'>
      <div className='flex gap-3'>
        <Avatar>
          <AvatarImage
            src={session?.user.image ?? ''}
            alt={`@${session?.user.username ?? ''}`}
          />
          <AvatarFallback>
            {session?.user.firstName?.charAt(0).toUpperCase()}
            {session?.user.lastName?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className='flex flex-col justify-center gap-0.5'>
          <span className='font-medium !leading-none lg:text-lg'>
            {capitalize(session?.user.firstName ?? '')}{' '}
            {capitalize(session?.user.lastName ?? '')}
          </span>
          <span className='text-sm !leading-none text-slate-400'>
            {`@${session?.user.username ?? ''}`}
          </span>
        </div>
      </div>
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
