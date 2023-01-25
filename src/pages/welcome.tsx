import { type GetServerSideProps, type NextPage } from 'next';
import { type Dispatch, type SetStateAction, useState, type FC } from 'react';
import Button from '../components/ui/Button';
import TileButton from '../components/ui/TileButton';
import { getServerAuthSession } from '../server/auth';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useError } from '../hooks/useError';

const Welcome: NextPage = () => {
  const [checkedRoles, setCheckedRoles] = useState<string[]>([]);
  const { setError, Error } = useError();

  function proceed() {
    if (checkedRoles.length === 0) {
      setError('Please select at least one role.');
      return;
    }
    console.log('proceed');
  }

  return (
    <main className='flex min-h-screen w-screen flex-col items-center justify-center bg-slate-900 text-slate-50'>
      <div className='flex flex-col items-center gap-2'>
        <h1 className='text-4xl sm:text-5xl'>Welcome!</h1>
        <p className='text-lg text-slate-300'>Pick your roles to start</p>
      </div>
      <div className='mt-12 flex w-11/12 max-w-2xl flex-col gap-6'>
        <div className='flex w-full flex-wrap gap-4'>
          <RoleButton
            title='driver'
            description='Attend and schedule races, post results'
            roles={checkedRoles}
            setRoles={setCheckedRoles}
          />
          <RoleButton
            title='manager'
            description='create teams, schedule endurance events, see drivers results'
            roles={checkedRoles}
            setRoles={setCheckedRoles}
          />
        </div>
        <Error className='ml-auto' />
        <Button
          intent='primary'
          className='ml-auto overflow-hidden'
          onClick={proceed}
        >
          <span>Proceed</span>
          <ArrowRightIcon className='h-6 w-6 text-slate-50' />
        </Button>
      </div>
    </main>
  );
};

const RoleButton: FC<{
  title: string;
  description: string;
  roles: string[];
  setRoles: Dispatch<SetStateAction<string[]>>;
}> = ({ title, description, roles, setRoles }) => {
  return (
    <TileButton
      size='big'
      className='w-full sm:w-[calc(50%_-_0.5rem)]'
      checked={roles.includes(title)}
      onClick={() =>
        setRoles(prev =>
          prev.includes(title)
            ? prev.filter(role => role !== title)
            : [...prev, title]
        )
      }
    >
      <span className='text-xl font-semibold capitalize tracking-wide sm:text-2xl'>
        {title}
      </span>
      <span className='text-base'>{description}</span>
    </TileButton>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const session = await getServerAuthSession(ctx);

  console.log('roles', session?.user?.roles);

  if (session?.user?.roles) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default Welcome;
