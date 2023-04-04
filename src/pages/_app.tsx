import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { DefaultSeo } from 'next-seo';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { api } from '../utils/api';

import '../styles/globals.css';

import { useRouter } from 'next/router';
import { useMemo } from 'react';
import Navbar from '../components/Navbar';
import Settings from '../components/Settings';
import PostResult from '@dashboard/results/PostResult';
import DeleteEvent from '@dashboard/events/DeleteEvent';
import DeleteChampionship from '@dashboard/championships/DeleteChampionship';
import NewChampionship from '@dashboard/championships/NewChampionship';
import DeleteDriver from '@dashboard/manageTeam/DeleteDriver';
import DeleteTeam from '@dashboard/manageTeam/DeleteTeam';
import EditEvent from '@dashboard/events/EditEvent';
import NewEvent from '@dashboard/events/NewEvent';
import EditTeam from '@dashboard/manageTeam/EditTeam';
import CreateTeam from '@dashboard/manageTeam/CreateTeam';
import PostSetup from '../components/PostSetup';
import PostChampResult from '@dashboard/results/PostChampResult';
import EditSetup from '../components/EditSetup';

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
        </>
      )}
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
