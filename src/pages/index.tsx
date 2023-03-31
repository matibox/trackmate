import Calendar from '@dashboard/calendar/Calendar';
import Championships from '@dashboard/championships/Championships';
import Events from '@dashboard/events/Events';
import ManageTeam from '@dashboard/manageTeam/ManageTeam';
import Results from '@dashboard/results/Results';
import Team from '@dashboard/team/Team';
import { type GetServerSideProps, type NextPage } from 'next';
import { NextSeo } from 'next-seo';
import { getServerAuthSession } from '../server/auth';

const Home: NextPage = () => {
  return (
    <>
      <NextSeo title='Dashboard' />
      <main className='min-h-screen w-full bg-slate-900 pt-[var(--navbar-height)]'>
        <div className='grid grid-flow-dense grid-cols-1 gap-4 p-4 md:h-auto md:grid-cols-2 lg:grid-cols-[35%_1fr] xl:grid-cols-[25%_1fr_1fr]'>
          <Calendar />
          <Events />
          <Team />
          <Championships />
          <Results />
          <ManageTeam />
        </div>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};

export default Home;
