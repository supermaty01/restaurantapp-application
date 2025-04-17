import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "@/services/db/schema";
import { and, eq } from "drizzle-orm";
import { TagDTO } from "../types/tag-dto";
import { useLiveTablesQuery } from "@/lib/hooks/useLiveTablesQuery";

export const useTagById = (id: number, includeDeleted: boolean = true) => {
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
    
  // Filtrar por ID y, opcionalmente, por estado de eliminación
  if (includeDeleted) {
    query.where(eq(schema.tags.id, id));
  } else {
    query.where(and(eq(schema.tags.id, id), eq(schema.tags.deleted, false)));
  }
  
  const { data: rawData } = useLiveTablesQuery(query, ["tags"]);
  
  // Devolver la primera etiqueta encontrada o null si no hay resultados
  return rawData?.length ? {
    id: rawData[0].id,
    name: rawData[0].name,
    color: rawData[0].color,
    deleted: rawData[0].deleted,
  } : null;
};
