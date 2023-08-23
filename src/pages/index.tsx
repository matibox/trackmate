import { type NextPage } from 'next';
import Link from 'next/link';
import { Button } from '~/components/ui/Button';

const Home: NextPage = () => {
  return (
    <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
      <Button asChild>
        <Link href='/login'>Sign in</Link>
      </Button>
    </div>
  );
};

export default Home;
