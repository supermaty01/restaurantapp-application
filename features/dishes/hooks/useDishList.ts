import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "@/services/db/schema";
import { and, eq } from "drizzle-orm";
import { DishListDTO } from "../types/dish-dto";
import { useLiveTablesQuery } from "@/lib/hooks/useLiveTablesQuery";

export const useDishList = (includeDeleted: boolean = false) => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const query = drizzleDb
    .select({
      dishId: schema.dishes.id,
      dishName: schema.dishes.name,
      dishComments: schema.dishes.comments,
      dishRating: schema.dishes.rating,
      dishDeleted: schema.dishes.deleted,
      tagId: schema.tags.id,
      tagName: schema.tags.name,
      tagColor: schema.tags.color,
      imageId: schema.images.id,
      imagePath: schema.images.path,
    })
    .from(schema.dishes);

  // Si no se incluyen los eliminados, filtrarlos
  if (!includeDeleted) {
    query.where(eq(schema.dishes.deleted, false));
  }

  query.leftJoin(schema.dishTags, eq(schema.dishes.id, schema.dishTags.dishId))
      .leftJoin(schema.tags, eq(schema.dishTags.tagId, schema.tags.id))
      .leftJoin(schema.images, eq(schema.dishes.id, schema.images.dishId));

  const { data: rawData } = useLiveTablesQuery(query
  , ["dishes", "dishTags", "tags", "images"]);

  const dishes = rawData?.reduce<DishListDTO[]>((acc, row) => {
    let dish = acc.find((r) => r.id === row.dishId);
    if (!dish) {
      dish = {
        id: row.dishId,
        name: row.dishName,
        comments: row.dishComments,
        rating: row.dishRating,
        deleted: row.dishDeleted,
        tags: [],
        images: [],
      };
      acc.push(dish);
    }

    if (row.tagId && !dish.tags.some((t) => t.id === row.tagId)) {
      dish.tags.push({
        id: row.tagId,
        name: row.tagName!,
        color: row.tagColor!,
      });
    }

    // Agregar imágenes
    if (row.imageId && !dish.images.some((i) => i.id === row.imageId)) {
      dish.images.push({
        id: row.imageId,
        uri: row.imagePath!,
      });
    }

    return acc;
  }, []);

  return dishes ?? [];
};
