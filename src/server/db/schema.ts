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
import {
  type CarName,
  type Game,
  type TrackName,
  type Country,
} from '~/lib/constants';

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
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  usersToTeams: many(usersToTeams),
  events: many(driversToEvents),
  telemetry: many(telemetry),
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
  events: many(events),
}));

export const driversToEvents = createTable(
  'drivers_to_events',
  {
    eventId: integer('event_id', { mode: 'number' }).references(
      () => events.id
    ),
    driverId: text('driver_id').references(() => users.id),
  },
  table => ({
    pk: primaryKey({ columns: [table.eventId, table.driverId] }),
  })
);

export const driversToEventsRelations = relations(
  driversToEvents,
  ({ one }) => ({
    event: one(events, {
      fields: [driversToEvents.eventId],
      references: [events.id],
    }),
    driver: one(users, {
      fields: [driversToEvents.driverId],
      references: [users.id],
    }),
  })
);

export const events = createTable('event', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name', { length: 255 }).notNull(),
  date: int('start_date', { mode: 'timestamp' }).notNull(),
  game: text('game', { length: 255 }).notNull().$type<Game>(),
  track: text('track', { length: 255 }).notNull().$type<TrackName>(),
  car: text('car', { length: 255 }).notNull().$type<CarName>(),
  teamId: integer('team_id', { mode: 'number' }).references(() => teams.id),
});

export const eventsRelations = relations(events, ({ one, many }) => ({
  team: one(teams, { fields: [events.teamId], references: [teams.id] }),
  drivers: many(driversToEvents),
}));

export const telemetry = createTable('telemetry', {
  id: text('id', { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  game: text('game', { length: 255 }).notNull().$type<Game>(),
  track: text('track', { length: 255 }).notNull().$type<TrackName>(),
  car: text('car', { length: 255 }).notNull().$type<CarName>(),
  filename: text('filename', { length: 255 }).notNull(),
  path: text('path', { length: 255 }).notNull(),
  size: integer('size', { mode: 'number' }).notNull(),
  uploadedAt: int('uploaded_at', {
    mode: 'timestamp',
  }).default(sql`(unixepoch())`),
  userId: text('user_id', { length: 255 })
    .notNull()
    .references(() => users.id),
});

export const telemetryRelations = relations(telemetry, ({ one }) => ({
  user: one(users, { fields: [telemetry.userId], references: [users.id] }),
}));
