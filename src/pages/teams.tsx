import { FilterIcon, SearchIcon } from 'lucide-react';
import { type GetServerSidePropsContext, type NextPage } from 'next';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { Suspense, lazy, useState } from 'react';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/Tabs';
import { Toaster } from '~/components/ui/Toaster';
import DashboardLayout from '~/core/dashboard/Layout';
import TeamList from '~/core/dashboard/teams/TeamList';
import NewTeam from '~/core/dashboard/teams/new-team/NewTeam';
import { useNewTeam } from '~/core/dashboard/teams/new-team/newTeamStore';
import { useDebounce } from '~/hooks/useDebounce';
import { useProtectedRoute } from '~/hooks/useProtectedRoute';
import { getServerAuthSession } from '~/server/auth';

const YourTeams = lazy(() => import('~/core/dashboard/teams/YourTeams'));

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

  const [query, setQuery] = useState('');

  useDebounce(
    () => {
      void router.replace({
        query: { ...router.query, q: query },
      });
    },
    500,
    [query]
  );

  return (
    <>
      <NextSeo title='Teams' />
      <div className='relative min-h-screen'>
        <Toaster />
        <DashboardLayout>
          <div className='grid grid-cols-1 justify-center gap-4'>
            <div className='hidden lg:mb-8 lg:flex lg:items-center lg:justify-between lg:pr-12'>
              <div className='flex flex-col gap-2'>
                <h1 className='text-5xl font-bold leading-none'>Teams</h1>
                <span className='leading-none text-slate-300'>
                  Manage, create and join teams.
                </span>
              </div>
              <Button
                variant='primary'
                onClick={() => setNewTeamFormOpened(true)}
              >
                New team
              </Button>
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
                <div className='flex w-full gap-4 self-start'>
                  <div className='relative grow sm:grow-0'>
                    <Input
                      type='text'
                      placeholder='Search'
                      className='h-9 w-full placeholder:text-sm placeholder:font-medium sm:w-64'
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                    />
                    <SearchIcon className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                  </div>
                  <Button variant='ghost' className='h-9 w-9 px-0'>
                    <FilterIcon className='h-[18px] w-[18px] text-slate-50' />
                  </Button>
                </div>
                {/* <TeamList /> */}
              </TabsContent>
            </Tabs>
          </div>
        </DashboardLayout>
      </div>
    </>
  );
};

export default Teams;
