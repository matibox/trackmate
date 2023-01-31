import Calendar from '@dashboard/calendar/Calendar';
import Championships from '@dashboard/championships/Championships';
import DeleteChampionship from '@dashboard/championships/DeleteChampionship';
import NewChampionship from '@dashboard/championships/NewChampionship';
import Events from '@dashboard/events/Events';
import NewEvent from '@dashboard/events/NewEvent';
import CreateTeam from '@dashboard/manageTeam/CreateTeam';
import DeleteDriver from '@dashboard/manageTeam/DeleteDriver';
import DeleteTeam from '@dashboard/manageTeam/DeleteTeam';
import EditTeam from '@dashboard/manageTeam/EditTeam';
import ManageTeam from '@dashboard/manageTeam/ManageTeam';
import Team from '@dashboard/team/Team';
import { type GetServerSideProps, type NextPage } from 'next';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import { getServerAuthSession } from '../server/auth';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Dashboard | Race Results App</title>
        <meta name='description' content='Race results app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Navbar />
      <main className='min-h-[calc(100vh_-_var(--navbar-height))] w-full bg-slate-900'>
        <DeleteChampionship />
        <NewChampionship />
        <DeleteDriver />
        <DeleteTeam />
        <NewEvent />
        <EditTeam />
        <CreateTeam />
        <div className='grid grid-flow-dense grid-cols-1 gap-4 p-4 md:h-auto md:grid-cols-2 lg:grid-cols-[35%_1fr] xl:grid-cols-[25%_1fr_1fr]'>
          <Calendar />
          <Events />
          <Team />
          <Championships />
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
