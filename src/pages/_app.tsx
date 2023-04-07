import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { DefaultSeo } from 'next-seo';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { api } from '~/utils/api';

import '~/styles/globals.css';

import { useRouter } from 'next/router';
import { useMemo } from 'react';
import Navbar from '~/components/Navbar';
import Settings from '~/components/Settings';
import PostResult from '~/components/dashboard/results/PostResult';
import DeleteEvent from '~/components/dashboard/events/DeleteEvent';
import DeleteChampionship from '~/components/dashboard/championships/DeleteChampionship';
import NewChampionship from '~/components/dashboard/championships/NewChampionship';
import DeleteDriver from '~/components/dashboard/manageTeam/DeleteDriver';
import DeleteTeam from '~/components/dashboard/manageTeam/DeleteTeam';
import EditEvent from '~/components/dashboard/events/EditEvent';
import NewEvent from '~/components/dashboard/events/NewEvent';
import EditTeam from '~/components/dashboard/manageTeam/EditTeam';
import CreateTeam from '~/components/dashboard/manageTeam/CreateTeam';
import PostSetup from '~/components/PostSetup';
import PostChampResult from '~/components/dashboard/results/PostChampResult';
import EditSetup from '~/components/EditSetup';
import DeleteSetup from '~/components/DeleteSetup';
import EventSetups from '~/components/dashboard/events/EventSetups';

const specialRoutes = ['/login', '/welcome'];

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();
  const isSpecialRoute = useMemo(
    () => specialRoutes.includes(router.pathname),
    [router.pathname]
  );

  return (
    <SessionProvider session={session}>
      <DefaultSeo
        titleTemplate='%s | Race Results App'
        description='Revisited race planning and results posting'
        openGraph={{
          type: 'website',
          title: 'Race Results App',
        }}
        additionalLinkTags={[
          {
            rel: 'icon',
            href: '/favicon.ico',
          },
          {
            rel: 'manifest',
            href: '/manifest.json',
          },
          {
            rel: 'apple-touch-icon',
            href: '/icon-192x192.png',
          },
        ]}
        additionalMetaTags={[
          {
            name: 'theme-color',
            content: '#1e293b',
          },
        ]}
      />
      <ReactQueryDevtools />
      {!isSpecialRoute && (
        <>
          <Navbar />
          <Settings />
          <PostResult />
          <DeleteEvent />
          <DeleteChampionship />
          <NewChampionship />
          <DeleteDriver />
          <DeleteTeam />
          <EditEvent />
          <NewEvent />
          <EditTeam />
          <CreateTeam />
          <PostSetup />
          <PostChampResult />
          <EditSetup />
          <DeleteSetup />
          <EventSetups />
        </>
      )}
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
