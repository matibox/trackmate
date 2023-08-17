import { type NextPage } from 'next';
import { Button } from '~/components/ui/Button';

const Home: NextPage = () => {
  return (
    <div>
      <Button className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
        Test button
      </Button>
    </div>
  );
};

export default Home;
