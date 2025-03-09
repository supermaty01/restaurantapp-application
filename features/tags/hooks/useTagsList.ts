import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite"
import * as schema from '@/services/db/schema';

export const useTagsList = () => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  return useLiveQuery(
    drizzleDb.query.tags.findMany()
  );
}