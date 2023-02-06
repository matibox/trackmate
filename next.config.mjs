// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
import withPWA from 'next-pwa';

!process.env.SKIP_ENV_VALIDATION && (await import('./src/env/server.mjs'));

const PWAConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

/** @type {import("next").NextConfig} */
const config = PWAConfig({
  reactStrictMode: true,
  /* If trying out the experimental appDir, comment the i18n config out
   * @see https://github.com/vercel/next.js/issues/41980 */
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  images: {
    remotePatterns: [
      {
        hostname: 'cdn.discordapp.com',
        protocol: 'https',
      },
    ],
  },
});
export default config;
