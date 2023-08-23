import { type NextPage } from 'next';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '~/components/ui/Button';

const Home: NextPage = () => {
  const { data: session } = useSession();

  return (
    <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
      {session ? (
        <div className='flex flex-col gap-2'>
          <span>Hello {session.user.name ?? 'user'}</span>
          <Button onClick={() => void signOut()}>Sign out</Button>
        </div>
      ) : (
        <Button asChild>
          <Link href='/login'>Sign in</Link>
        </Button>
      )}
    </div>
  );
};

export default Home;
