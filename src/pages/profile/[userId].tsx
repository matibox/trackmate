import { type GetServerSideProps, type NextPage } from 'next';
import { NextSeo } from 'next-seo';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Settings from '../../components/Settings';
import { useError } from '../../hooks/useError';
import { getServerAuthSession } from '../../server/auth';
import { api, type RouterOutputs } from '../../utils/api';
import { AnimatePresence, motion } from 'framer-motion';
import Loading from '@ui/Loading';
import Tile from '@ui/Tile';
import Link from 'next/link';
import { LinkIcon } from '@heroicons/react/20/solid';
import dayjs from 'dayjs';
import { useCallback, useMemo } from 'react';

type Profile = RouterOutputs['user']['getProfile'];

function useStats(profile: Profile | undefined) {
  const countStats = useCallback(
    (
      filterFn: (result: NonNullable<Profile>['results'][number]) => boolean
    ) => {
      if (!profile) return 0;
      const { results } = profile;
      return results.filter(filterFn).length;
    },
    [profile]
  );

  const podiums = useMemo(() => {
    return countStats(result => {
      const { racePosition } = result;
      if (racePosition) {
        return racePosition <= 3;
      }
      return false;
    });
  }, [countStats]);

  const wins = useMemo(() => {
    return countStats(result => {
      const { racePosition } = result;
      if (racePosition) {
        return racePosition === 1;
      }
      return false;
    });
  }, [countStats]);

  const polePositions = useMemo(() => {
    return countStats(result => {
      const { qualiPosition } = result;
      if (qualiPosition) {
        return qualiPosition === 1;
      }
      return false;
    });
  }, [countStats]);

  const raceStarts = useMemo(() => {
    return countStats(() => true);
  }, [countStats]);

  const DNFs = useMemo(() => {
    return countStats(result => result.DNF);
  }, [countStats]);

  return { wins, podiums, polePositions, raceStarts, DNFs };
}

const Profile: NextPage = () => {
  const router = useRouter();
  const { userId } = router.query;

  const { Error, setError } = useError();

  const { data: profile, isLoading } = api.user.getProfile.useQuery(
    { userId: userId as string },
    {
      enabled: Boolean(userId),
      onError: err => setError(err.message),
    }
  );

  const { wins, podiums, polePositions, raceStarts, DNFs } = useStats(profile);

  return (
    <>
      <NextSeo title={profile?.name ?? 'Profile'} />
      <Navbar />
      <main className='relative min-h-screen w-full bg-slate-900 pt-[var(--navbar-height)] text-slate-50'>
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className='absolute top-0 left-0 grid h-full w-full place-items-center bg-black/50'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Loading />
            </motion.div>
          )}
        </AnimatePresence>
        <Settings />
        <Error />
        <div className='grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3'>
          {profile && (
            <>
              <Tile>
                <div className='flex items-center gap-4'>
                  <Image
                    src={profile.image ?? '/DefaultAvatar.png'}
                    alt={`${profile.name ?? 'user'}'s avatar`}
                    width={100}
                    height={100}
                    priority={true}
                    className='rounded-full'
                  />
                  <div className='flex flex-col gap-1'>
                    <h1 className='text-lg font-semibold'>{profile.name}</h1>
                    <span>
                      User since:{' '}
                      {dayjs(profile.createdAt).format('DD MMM YYYY')}
                    </span>
                    {profile.team?.name && (
                      <Link
                        href={`/team/${profile.team.id}`}
                        className='flex items-center gap-1 text-slate-300 transition-colors hover:text-sky-400'
                      >
                        <span>{profile.team.name}</span>
                        <LinkIcon className='h-4' />
                      </Link>
                    )}
                  </div>
                </div>
              </Tile>
              <Tile>
                <div className='flex h-full flex-col justify-center gap-2'>
                  <h1 className='text-lg font-semibold'>User statistics</h1>
                  <div className='flex flex-col sm:grid sm:grid-cols-2 sm:gap-y-1 md:grid-cols-3'>
                    <div>
                      Race starts:
                      <span className='font-semibold text-sky-400'>
                        {' '}
                        {raceStarts}
                      </span>
                    </div>
                    <div>
                      Wins:
                      <span className='font-semibold text-sky-400'>
                        {' '}
                        {wins}
                      </span>
                    </div>
                    <div>
                      Podiums:
                      <span className='font-semibold text-sky-400'>
                        {' '}
                        {podiums}
                      </span>
                    </div>
                    <div>
                      Poles:
                      <span className='font-semibold text-sky-400'>
                        {' '}
                        {polePositions}
                      </span>
                    </div>
                    <div>
                      DNFs:
                      <span className='font-semibold text-sky-400'>
                        {' '}
                        {DNFs}
                      </span>
                    </div>
                  </div>
                </div>
              </Tile>
            </>
          )}
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
    props: { session },
  };
};

export default Profile;
