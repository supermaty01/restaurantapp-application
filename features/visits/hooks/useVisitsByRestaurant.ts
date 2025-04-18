import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "@/services/db/schema";
import { eq } from "drizzle-orm";
import { VisitListDTO } from "../types/visit-dto";
import { useLiveTablesQuery } from "@/lib/hooks/useLiveTablesQuery";
import { imagePathToUri } from "@/lib/helpers/image-paths";

export const useVisitsByRestaurant = (restaurantId: number | undefined) => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const { data: rawData } = useLiveTablesQuery(
    restaurantId
      ? drizzleDb
          .select({
            visitId: schema.visits.id,
            visitedAt: schema.visits.visitedAt,
            visitComments: schema.visits.comments,
            restaurantId: schema.restaurants.id,
            restaurantName: schema.restaurants.name,
            imageId: schema.images.id,
            imagePath: schema.images.path,
          })
          .from(schema.visits)
          .where(eq(schema.visits.restaurantId, restaurantId))
          .leftJoin(schema.restaurants, eq(schema.visits.restaurantId, schema.restaurants.id))
          .leftJoin(schema.images, eq(schema.visits.id, schema.images.visitId))
      : drizzleDb.select().from(schema.visits).where(eq(schema.visits.id, -1)), // Query vacía si no hay restaurantId
    ["visits", "restaurants", "images"],
    [restaurantId]
  );

  // @ts-ignore - Ignorar errores de tipo en el resultado de la consulta
  const visits = rawData?.reduce<VisitListDTO[]>((acc, row: any) => {
    if (!row.visitId) return acc;

    let visit = acc.find((v) => v.id === row.visitId);
    if (!visit) {
      visit = {
        id: row.visitId,
        visited_at: row.visitedAt || "",
        comments: row.visitComments || null,
        restaurant: {
          id: row.restaurantId || 0,
          name: row.restaurantName || "",
        },
        images: [],
      };
      acc.push(visit);
    }

    // Agregar imágenes
    if (row.imageId && row.imagePath && !visit.images.some((i) => i.id === row.imageId)) {
      visit.images.push({
        id: row.imageId,
        uri: imagePathToUri(row.imagePath),
      });
    }

    return acc;
  }, []);

  return visits || [];
};
