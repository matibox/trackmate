import { type GetServerSideProps, type NextPage } from 'next';
import { type Dispatch, type SetStateAction, useState, type FC } from 'react';
import TileButton from '../components/ui/TileButton';
import { getServerAuthSession } from '../server/auth';

const Welcome: NextPage = () => {
  const [checkedRoles, setCheckedRoles] = useState<string[]>([]);

  return (
    <main className='flex min-h-screen w-screen flex-col items-center justify-center bg-slate-900 text-slate-50'>
      <h1 className='mb-2 text-3xl sm:text-5xl'>Welcome!</h1>
      <p className='text-base text-slate-300 sm:text-lg'>
        Pick your roles to start
      </p>
      <div className='mt-12 flex w-11/12 max-w-2xl flex-wrap gap-4'>
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
      className='w-full sm:w-[calc(50%_-_1rem)]'
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
