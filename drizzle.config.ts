import type { Config } from 'drizzle-kit';

export default {
  schema: './services/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'expo',
} satisfies Config;