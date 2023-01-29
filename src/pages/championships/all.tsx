import { type GetServerSideProps, type NextPage } from 'next';
import Head from 'next/head';
import Navbar from '../../components/Navbar';
import { getServerAuthSession } from '../../server/auth';

const AllChampionships: NextPage = () => {
  return (
    <>
      <Head>
        <title>All championships | Race Results App</title>
        <meta name='description' content='Race results app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Navbar />
      <main className='min-h-[calc(100vh_-_var(--navbar-height))] w-full bg-slate-900'>
        all champs
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
    props: {},
  };
};

export default AllChampionships;
