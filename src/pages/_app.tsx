import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { type AppType } from 'next/app';
import { api } from '~/utils/api';
import '~/styles/globals.css';
import { DefaultSeo } from 'next-seo';
import Navbar from '~/components/Navbar';

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <DefaultSeo
        titleTemplate='%s - Trackmate'
        defaultTitle='Trackmate'
        description='Plan, Race, Win - Your Simracing Scheduler'
        openGraph={{
          type: 'website',
          description: 'Plan, Race, Win - Your Simracing Scheduler',
          url: 'https://trackmateapp.vercel.app/',
          title: 'Trackmate',
          images: [
            {
              url: '/og_image.png',
              secureUrl: '/og_image.png',
              alt: 'Trackmate star logo',
              height: 1375,
              width: 1375,
            },
          ],
        }}
        twitter={{ cardType: 'summary' }}
        additionalLinkTags={[
          {
            rel: 'icon',
            href: '/favicon.ico',
          },
          {
            rel: 'manifest',
            href: '/manifest.json',
          },
        ]}
        themeColor='#020617'
        additionalMetaTags={[
          {
            name: 'application-name',
            content: 'Trackmate',
          },
          {
            name: 'apple-mobile-web-app-capable',
            content: 'yes',
          },
          {
            name: 'apple-mobile-web-app-status-bar-style',
            content: 'default',
          },
          {
            name: 'apple-mobile-web-app-title',
            content: 'Trackmate',
          },
          {
            name: 'format-detection',
            content: 'telephone=no',
          },
          {
            name: 'mobile-web-app-capable',
            content: 'yes',
          },
        ]}
      />
      <div className='min-h-[100dvh] bg-slate-950 text-slate-50'>
        <Navbar disabledOn={['/', '/login', '/welcome']} />
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
