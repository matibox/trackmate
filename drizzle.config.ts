import { type Config } from 'drizzle-kit';

import { env } from '~/env';

export default {
  schema: './src/server/db/schema/',
  dialect: 'sqlite',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ['trackmate_*'],
} satisfies Config;
