import { type NextPage } from 'next';
import { Button } from '~/components/ui/Button';

const Home: NextPage = () => {
  return (
    <div className='absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-4'>
      <Button>Primary</Button>
      <Button intent='secondary'>Secondary</Button>
      <Button intent='positive'>Positive</Button>
      <Button intent='destructive'>Destructive</Button>
    </div>
  );
};

export default Home;
