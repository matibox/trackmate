import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { eq } from 'drizzle-orm';
import { type DefaultSession, type NextAuthConfig } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { type countries } from '~/lib/constants';

import { db } from '~/server/db';
import {
  users,
  accounts,
  sessions,
  verificationTokens,
  profiles,
} from '~/server/db/schema';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name: string;
      image: string | undefined;
      email: string;
      profile: {
        firstName: string;
        lastName: string;
        country: (typeof countries)[number];
      } | null;
      // ...other properties
      // role: UserRole;
    } & DefaultSession['user'];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    DiscordProvider,
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  trustHost: true,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  callbacks: {
    session: async ({ session, user }) => {
      const profile = await db
        .select({
          firstName: profiles.firstName,
          lastName: profiles.lastName,
          country: profiles.country,
        })
        .from(profiles)
        .where(eq(profiles.userId, session.user.id));

      session.user = {
        ...user,
        image: user.image ?? undefined,
        name: user.name ?? '',
        profile: profile[0],
      };

      return session;
    },
  },
} satisfies NextAuthConfig;
