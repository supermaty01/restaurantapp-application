import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite"
import * as schema from '@/services/db/schema';

export const useRestaurantById = (id: number) => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  return useLiveQuery(
    drizzleDb.query.restaurants.findFirst({
      with: {
        tags: true,
      },
    })
  );
}