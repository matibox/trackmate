import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import Loading from '@ui/Loading';
import { type GetServerSideProps, type NextPage } from 'next';
import { NextSeo } from 'next-seo';
import Link from 'next/link';
import { useMemo } from 'react';
import { useError } from '../hooks/useError';
import { getServerAuthSession } from '../server/auth';
import { api } from '../utils/api';
import Championship from '~/features/championships/Championship';

const YourChampionships: NextPage = () => {
  const { Error, setError } = useError();

  const { data: championships, isLoading: getChampsLoading } =
    api.championship.get.useQuery(
      { max: 0, upcoming: false },
      { onError: err => setError(err.message) }
    );

  const unarchivedChampionships = useMemo(
    () => championships?.filter(championship => !championship.archived),
    [championships]
  );

  const archivedChampionships = useMemo(
    () => championships?.filter(championship => championship.archived),
    [championships]
  );

  return (
    <>
      <NextSeo title='Your championships' />
      <main className='min-h-screen w-full bg-slate-900 pt-[var(--navbar-height)] text-slate-50'>
        <Link
          href='/'
          className='flex items-center gap-2 pl-4 pt-4 text-slate-300 transition-colors hover:text-sky-400'
        >
          <ChevronLeftIcon className='h-5' />
          <span className='text-base font-normal'>back</span>
        </Link>
        <Error />
        {getChampsLoading && (
          <div className='flex h-screen w-full items-center justify-center'>
            <Loading />
          </div>
        )}
        <h1 className='pt-4 pb-8 text-center text-2xl font-semibold sm:text-3xl'>
          Your Championships
        </h1>
        <div className='flex flex-col gap-4 px-4 pb-4'>
          {unarchivedChampionships?.map(championship => (
            <Championship key={championship.id} championship={championship} />
          ))}
        </div>
        {archivedChampionships && archivedChampionships.length > 0 && (
          <>
            <div className='mt-8 mb-6 ml-4 h-[1px] w-[calc(100%_-_2rem)] bg-slate-800 sm:mb-7' />
            <h2 className='mb-2 pl-4 text-base font-semibold sm:text-lg'>
              Archived championships
            </h2>
            <div className='flex flex-col gap-4 px-4 pb-4'>
              {archivedChampionships.map(championship => (
                <Championship
                  key={championship.id}
                  championship={championship}
                />
              ))}
            </div>
          </>
        )}
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
    props: { session },
  };
};

export default YourChampionships;
