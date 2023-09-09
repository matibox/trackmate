import { type NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '~/components/ui/Button';

const Home: NextPage = () => {
  const { data: session } = useSession();

  return (
    <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
      {session ? (
        <Button asChild>
          <Link href='/calendar'>Dashboard</Link>
        </Button>
      ) : (
        <Button asChild>
          <Link href='/login'>Sign in</Link>
        </Button>
      )}
    </div>
  );
};

export default Home;
