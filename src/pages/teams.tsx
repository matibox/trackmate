import { type GetServerSidePropsContext, type NextPage } from 'next';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { Suspense, lazy } from 'react';
import { Button } from '~/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/Tabs';
import DashboardLayout from '~/core/dashboard/Layout';
import NewTeam from '~/core/dashboard/teams/new-team/NewTeam';
import { useNewTeam } from '~/core/dashboard/teams/new-team/newTeamStore';
import { useProtectedRoute } from '~/hooks/useProtectedRoute';
import { getServerAuthSession } from '~/server/auth';

const YourTeams = lazy(() => import('~/core/dashboard/teams/YourTeams'));
const Explore = lazy(() => import('~/core/dashboard/teams/Explore'));

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  return {
    props: { session },
  };
}

const Teams: NextPage = () => {
  useProtectedRoute();

  const setNewTeamFormOpened = useNewTeam(s => s.setSheetOpened);
  const router = useRouter();

  return (
    <>
      <NextSeo title='Teams' />
      <div className='relative min-h-screen'>
        <DashboardLayout>
          <div className='grid grid-cols-1 justify-center gap-4'>
            <div className='hidden lg:mb-8 lg:flex lg:items-center lg:justify-between lg:pr-12'>
              <div className='flex flex-col gap-2'>
                <h1 className='text-5xl font-bold leading-none'>Teams</h1>
                <span className='leading-none text-slate-300'>
                  Manage, create and join teams.
                </span>
              </div>
              {(router.query.t as string | undefined) === 'your-teams' ? (
                <Button
                  variant='primary'
                  onClick={() => setNewTeamFormOpened(true)}
                >
                  New team
                </Button>
              ) : null}
            </div>
            <Tabs
              defaultValue={
                (router.query.t as string | undefined) ?? 'your-teams'
              }
              className='space-y-4'
              onValueChange={tab =>
                router.replace({ query: { ...router.query, t: tab } })
              }
            >
              <TabsList className='grid w-full max-w-[417px] grid-cols-2 bg-slate-900'>
                <TabsTrigger value='your-teams'>Your teams</TabsTrigger>
                <TabsTrigger value='explore'>Explore</TabsTrigger>
              </TabsList>
              <TabsContent value='your-teams'>
                <Suspense>
                  <YourTeams />
                </Suspense>
              </TabsContent>
              <TabsContent value='explore' className='flex flex-col gap-4'>
                <Suspense>
                  <Explore />
                </Suspense>
              </TabsContent>
            </Tabs>
            <NewTeam />
          </div>
        </DashboardLayout>
      </div>
    </>
  );
};

export default Teams;
