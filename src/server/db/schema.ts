import { relations, sql } from 'drizzle-orm';
import {
  index,
  int,
  integer,
  primaryKey,
  sqliteTableCreator,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { type AdapterAccount } from 'next-auth/adapters';
import { type Country } from '~/lib/constants';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator(name => `trackmate_${name}`);

// ==== NEXT AUTH ====

export const accounts = createTable(
  'account',
  {
    userId: text('user_id', { length: 255 })
      .notNull()
      .references(() => users.id),
    type: text('type', { length: 255 })
      .$type<AdapterAccount['type']>()
      .notNull(),
    provider: text('provider', { length: 255 }).notNull(),
    providerAccountId: text('provider_account_id', { length: 255 }).notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: int('expires_at'),
    token_type: text('token_type', { length: 255 }),
    scope: text('scope', { length: 255 }),
    id_token: text('id_token'),
    session_state: text('session_state', { length: 255 }),
  },
  account => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index('account_user_id_idx').on(account.userId),
  })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  'session',
  {
    sessionToken: text('session_token', { length: 255 }).notNull().primaryKey(),
    userId: text('userId', { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: int('expires', { mode: 'timestamp' }).notNull(),
  },
  session => ({
    userIdIdx: index('session_userId_idx').on(session.userId),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  'verification_token',
  {
    identifier: text('identifier', { length: 255 }).notNull(),
    token: text('token', { length: 255 }).notNull(),
    expires: int('expires', { mode: 'timestamp' }).notNull(),
  },
  vt => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// ====

export const users = createTable('user', {
  id: text('id', { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name', { length: 255 }),
  email: text('email', { length: 255 }).notNull(),
  emailVerified: int('email_verified', {
    mode: 'timestamp',
  }).default(sql`(unixepoch())`),
  image: text('image', { length: 255 }),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  accounts: many(accounts),
  profile: one(profiles),
  usersToTeams: many(usersToTeams),
}));

export const profiles = createTable(
  'profile',
  {
    id: text('id', { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id', { length: 255 })
      .notNull()
      .references(() => users.id),
    firstName: text('first_name', { length: 255 }).notNull(),
    lastName: text('last_name', { length: 255 }).notNull(),
    country: text('country', { length: 255 }).$type<Country>().notNull(),
  },
  table => ({
    firstNameIdx: index('first_name_idx').on(table.firstName),
    lastNameIdx: index('last_name_idx').on(table.lastName),
  })
);

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const teams = createTable(
  'team',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    name: text('name', { length: 255 }).notNull().unique(),
  },
  table => ({
    uniqueNameIdx: uniqueIndex('name_unique_idx').on(sql`lower(${table.name})`),
  })
);

export const teamsRelations = relations(teams, ({ many }) => ({
  usersToTeams: many(usersToTeams),
}));

export const usersToTeams = createTable(
  'users_to_teams',
  {
    teamId: integer('team_id', { mode: 'number' }).references(() => teams.id),
    userId: text('user_id').references(() => users.id),
  },
  table => ({
    pk: primaryKey({ columns: [table.teamId, table.userId] }),
  })
);

export const usersToTeamsRelations = relations(usersToTeams, ({ one }) => ({
  user: one(users, { fields: [usersToTeams.userId], references: [users.id] }),
  team: one(teams, { fields: [usersToTeams.teamId], references: [teams.id] }),
}));
