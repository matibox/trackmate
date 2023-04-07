import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { DefaultSeo } from 'next-seo';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { api } from '~/utils/api';

import '~/styles/globals.css';

import { useRouter } from 'next/router';
import { useMemo } from 'react';

import Navbar from '~/components/global/Navbar';
import Settings from '~/components/global/Settings';
import PostResult from '~/features/dashboard/events/popups/PostResult';
import DeleteEvent from '~/features/dashboard/events/popups/DeleteEvent';
import DeleteChampionship from '~/features/dashboard/championships/popups/DeleteChampionship';
import NewChampionship from '~/features/dashboard/championships/popups/NewChampionship';
import DeleteDriver from '~/features/dashboard/manageTeam/popups/DeleteDriver';
import DeleteTeam from '~/features/dashboard/manageTeam/popups/DeleteTeam';
import EditEvent from '~/features/dashboard/events/popups/EditEvent';
import NewEvent from '~/features/dashboard/events/popups/NewEvent';
import EditTeam from '~/features/dashboard/manageTeam/popups/EditTeam';
import CreateTeam from '~/features/dashboard/manageTeam/popups/CreateTeam';
import PostSetup from '~/features/setups/popups/PostSetup';
import EditSetup from '~/features/setups/popups/EditSetup';
import DeleteSetup from '~/features/setups/popups/DeleteSetup';
import EventSetups from '~/features/dashboard/events/popups/EventSetups';
import PostChampResult from '~/features/championships/popups/PostChampResult';

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
