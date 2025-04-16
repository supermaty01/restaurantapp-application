import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "@/services/db/schema";
import { eq, inArray } from "drizzle-orm";
import { DishListDTO } from "../types/dish-dto";
import { useLiveTablesQuery } from "@/lib/hooks/useLiveTablesQuery";

export const useDishesDetails = (dishIds: number[]) => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const { data: rawData } = useLiveTablesQuery(
    dishIds.length > 0
      ? drizzleDb
          .select({
            dishId: schema.dishes.id,
            dishName: schema.dishes.name,
            dishComments: schema.dishes.comments,
            dishRating: schema.dishes.rating,
            tagId: schema.tags.id,
            tagName: schema.tags.name,
            tagColor: schema.tags.color,
            imageId: schema.images.id,
            imagePath: schema.images.path,
          })
          .from(schema.dishes)
          .where(inArray(schema.dishes.id, dishIds))
          .leftJoin(schema.dishTags, eq(schema.dishes.id, schema.dishTags.dishId))
          .leftJoin(schema.tags, eq(schema.dishTags.tagId, schema.tags.id))
          .leftJoin(schema.images, eq(schema.dishes.id, schema.images.dishId))
      : drizzleDb.select().from(schema.dishes).where(eq(schema.dishes.id, -1)), // Query vacía si no hay dishIds
    ["dishes", "dishTags", "tags", "images"],
    [dishIds.join(",")]
  );

  // @ts-ignore - Ignorar errores de tipo en el resultado de la consulta
  const dishes = rawData?.reduce<DishListDTO[]>((acc, row: any) => {
    if (!row.dishId) return acc;

    let dish = acc.find((r) => r.id === row.dishId);
    if (!dish) {
      dish = {
        id: row.dishId,
        name: row.dishName || "",
        comments: row.dishComments || null,
        rating: row.dishRating || null,
        tags: [],
        images: [],
      };
      acc.push(dish);
    }

    if (row.tagId && row.tagName && row.tagColor && !dish.tags.some((t) => t.id === row.tagId)) {
      dish.tags.push({
        id: row.tagId,
        name: row.tagName,
        color: row.tagColor,
      });
    }

    // Agregar imágenes
    if (row.imageId && row.imagePath && !dish.images.some((i) => i.id === row.imageId)) {
      dish.images.push({
        id: row.imageId,
        uri: row.imagePath,
      });
    }

    return acc;
  }, []);

  return dishes ?? [];
};
