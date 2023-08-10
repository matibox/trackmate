import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { type AppType } from 'next/app';
import { api } from '~/utils/api';
import '~/styles/globals.css';
import { DefaultSeo } from 'next-seo';

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <DefaultSeo
        titleTemplate='%s - Trackmate'
        defaultTitle='Trackmate'
        description='Revisited race planning and results posting'
        openGraph={{
          type: 'website',
          url: 'https://trackmateapp.vercel.app/',
          title: 'Trackmate',
          images: [
            {
              url: '/og_image.png',
              alt: 'Trackmate star logo',
              height: 1375,
              width: 1375,
            },
          ],
        }}
        additionalLinkTags={[
          {
            rel: 'icon',
            href: '/favicon.ico',
          },
        ]}
      />
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
