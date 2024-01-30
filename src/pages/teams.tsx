import { type GetServerSidePropsContext, type NextPage } from 'next';
import { NextSeo } from 'next-seo';
import { Button } from '~/components/ui/Button';
import { Toaster } from '~/components/ui/Toaster';
import DashboardLayout from '~/core/dashboard/components/Layout';
import NewTeam from '~/core/dashboard/teams/new-team/components/NewTeam';
import { useProtectedRoute } from '~/hooks/useProtectedRoute';
import { getServerAuthSession } from '~/server/auth';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  return {
    props: { session },
  };
}

const Teams: NextPage = () => {
  useProtectedRoute();

  return (
    <>
      <NextSeo title='Teams' />
      <div className='relative min-h-screen'>
        <Toaster />
        <DashboardLayout>
          <div className='grid grid-cols-[min(100%,_370px)] justify-center gap-4 '>
            <div className='hidden lg:mb-8 lg:flex lg:items-center lg:justify-between lg:pr-12'>
              <div className='flex flex-col gap-2'>
                <h1 className='text-5xl font-bold leading-none'>Teams</h1>
                <span className='leading-none text-slate-300'>
                  Manage, create and join teams.
                </span>
              </div>
              <Button variant='primary' onClick={() => console.log('yes')}>
                New team
              </Button>
            </div>
            {/* team list */}
          </div>
          <NewTeam />
        </DashboardLayout>
      </div>
    </>
  );
};

export default Teams;
