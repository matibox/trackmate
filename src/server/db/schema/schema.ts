import { relations, sql } from 'drizzle-orm';
import { int, sqliteTableCreator, text } from 'drizzle-orm/sqlite-core';
import { accounts } from './auth';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator(name => `trackmate_${name}`);

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

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));
