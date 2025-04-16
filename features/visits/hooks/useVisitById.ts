import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "@/services/db/schema";
import { eq } from "drizzle-orm";
import { VisitDetailsDTO } from "../types/visit-dto";
import { useLiveTablesQuery } from "@/lib/hooks/useLiveTablesQuery";

export const useVisitById = (id: number) => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  
  const { data: rawData } = useLiveTablesQuery(drizzleDb
    .select({
      visitId: schema.visits.id,
      visitedAt: schema.visits.visitedAt,
      visitComments: schema.visits.comments,
      restaurantId: schema.restaurants.id,
      restaurantName: schema.restaurants.name,
      imageId: schema.images.id,
      imagePath: schema.images.path,
      dishId: schema.dishes.id,
      dishName: schema.dishes.name,
    })
    .from(schema.visits)
    .where(eq(schema.visits.id, id))
    .leftJoin(schema.restaurants, eq(schema.visits.restaurantId, schema.restaurants.id))
    .leftJoin(schema.images, eq(schema.visits.id, schema.images.visitId))
    .leftJoin(schema.dishVisits, eq(schema.visits.id, schema.dishVisits.visitId))
    .leftJoin(schema.dishes, eq(schema.dishVisits.dishId, schema.dishes.id))
  , ["visits", "restaurants", "images", "dishVisits", "dishes"]);
  
  const visits = rawData?.reduce<VisitDetailsDTO[]>((acc, row) => {
    let visit = acc.find((v) => v.id === row.visitId);
    if (!visit) {
      visit = {
        id: row.visitId,
        visited_at: row.visitedAt,
        comments: row.visitComments,
        restaurant: {
          id: row.restaurantId!,
          name: row.restaurantName!,
        },
        images: [],
        dishes: [],
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
    
    // Agregar platos
    if (row.dishId && !visit.dishes.some((d) => d.id === row.dishId)) {
      visit.dishes.push({
        id: row.dishId,
        name: row.dishName!,
      });
    }
    
    return acc;
  }, []);

  return visits?.[0];
};
