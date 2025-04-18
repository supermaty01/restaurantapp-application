import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite"
import * as schema from '@/services/db/schema';
import { eq } from "drizzle-orm";

export const useTagsList = (includeDeleted: boolean = false) => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  return useLiveQuery(
    includeDeleted
      ? drizzleDb.query.tags.findMany()
      : drizzleDb.select().from(schema.tags).where(eq(schema.tags.deleted, false))
  );
}