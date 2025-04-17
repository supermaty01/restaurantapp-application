import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "@/services/db/schema";
import { VisitListDTO } from "../types/visit-dto";
import { and, eq } from "drizzle-orm";
import { useLiveTablesQuery } from "@/lib/hooks/useLiveTablesQuery";

export const useVisitList = (includeDeleted: boolean = false) => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const query = drizzleDb
    .select({
      visitId: schema.visits.id,
      visitedAt: schema.visits.visitedAt,
      visitComments: schema.visits.comments,
      visitDeleted: schema.visits.deleted,
      restaurantId: schema.restaurants.id,
      restaurantName: schema.restaurants.name,
      restaurantDeleted: schema.restaurants.deleted,
      imageId: schema.images.id,
      imagePath: schema.images.path,
    })
    .from(schema.visits);

  // Si no se incluyen los eliminados, filtrarlos
  if (!includeDeleted) {
    query.where(eq(schema.visits.deleted, false));
  }

  query.leftJoin(schema.restaurants, eq(schema.visits.restaurantId, schema.restaurants.id))
      .leftJoin(schema.images, eq(schema.visits.id, schema.images.visitId));

  const { data: rawData } = useLiveTablesQuery(query
  , ["visits", "restaurants", "images"]);

  const visits = rawData?.reduce<VisitListDTO[]>((acc, row) => {
    let visit = acc.find((v) => v.id === row.visitId);
    if (!visit) {
      visit = {
        id: row.visitId,
        visited_at: row.visitedAt,
        comments: row.visitComments,
        deleted: row.visitDeleted,
        restaurant: {
          id: row.restaurantId!,
          name: row.restaurantName!,
          deleted: row.restaurantDeleted,
        },
        images: [],
      };
      acc.push(visit);
    }

    // Agregar imágenes
    if (row.imageId && !visit.images.some((i) => i.id === row.imageId)) {
      visit.images.push({
        id: row.imageId,
        uri: row.imagePath!,
      });
    }

    return acc;
  }, []);

  return visits || [];
};
