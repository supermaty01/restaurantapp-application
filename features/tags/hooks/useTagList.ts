import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "@/services/db/schema";
import { eq } from "drizzle-orm";
import { TagDTO } from "../types/tag-dto";
import { useLiveTablesQuery } from "@/lib/hooks/useLiveTablesQuery";

export const useTagList = (includeDeleted: boolean = false) => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  
  const query = drizzleDb
    .select({
      id: schema.tags.id,
      name: schema.tags.name,
      color: schema.tags.color,
      deleted: schema.tags.deleted,
    })
    .from(schema.tags);
    
  // Si no se incluyen los eliminados, filtrarlos
  if (!includeDeleted) {
    query.where(eq(schema.tags.deleted, false));
  }
  
  const { data: rawData } = useLiveTablesQuery(query, ["tags"]);
  
  // Convertir los resultados a TagDTO
  const tags: TagDTO[] = rawData?.map(row => ({
    id: row.id,
    name: row.name,
    color: row.color,
    deleted: row.deleted,
  })) || [];
  
  return tags;
};
