import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "@/services/db/schema";
import { and, eq } from "drizzle-orm";
import { DishListDTO } from "../types/dish-dto";
import { useLiveTablesQuery } from "@/lib/hooks/useLiveTablesQuery";

export const useDishesByRestaurant = (restaurantId: number | undefined, includeDeleted: boolean = false) => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  let query: any = drizzleDb
    .select({
      dishId: schema.dishes.id,
      dishName: schema.dishes.name,
      dishComments: schema.dishes.comments,
      dishRating: schema.dishes.rating,
      dishDeleted: schema.dishes.deleted,
      tagId: schema.tags.id,
      tagName: schema.tags.name,
      tagColor: schema.tags.color,
      tagDeleted: schema.tags.deleted,
      imageId: schema.images.id,
      imagePath: schema.images.path,
    })
    .from(schema.dishes);

  if (restaurantId) {
    if (includeDeleted) {
      // Solo filtrar por restaurantId
      query = query.where(eq(schema.dishes.restaurantId, restaurantId));
    } else {
      // Filtrar por restaurantId y no eliminados
      query = query.where(and(
        eq(schema.dishes.restaurantId, restaurantId),
        eq(schema.dishes.deleted, false)
      ));
    }
  } else {
    // Si no hay restaurantId, devolver una consulta vacía
    query = query.where(eq(schema.dishes.id, -1));
  }

  query = query
    .leftJoin(schema.dishTags, eq(schema.dishes.id, schema.dishTags.dishId))
    .leftJoin(schema.tags, eq(schema.dishTags.tagId, schema.tags.id))
    .leftJoin(schema.images, eq(schema.dishes.id, schema.images.dishId));

  const { data: rawData } = useLiveTablesQuery(
    query,
    ["dishes", "dishTags", "tags", "images"],
    [restaurantId, includeDeleted]
  );

  // @ts-ignore - Ignorar errores de tipo en el resultado de la consulta
  const dishes = rawData?.reduce<DishListDTO[]>((acc, row: any) => {
    if (!row.dishId) return acc;

    let dish = acc.find((r: any) => r.id === row.dishId);
    if (!dish) {
      dish = {
        id: row.dishId,
        name: row.dishName || "",
        comments: row.dishComments || null,
        rating: row.dishRating || null,
        deleted: row.dishDeleted,
        tags: [],
        images: [],
      };
      acc.push(dish);
    }

    if (row.tagId && row.tagName && row.tagColor && !dish.tags.some((t: any) => t.id === row.tagId)) {
      dish.tags.push({
        id: row.tagId,
        name: row.tagName,
        color: row.tagColor,
        deleted: row.tagDeleted,
      });
    }

    // Agregar imágenes
    if (row.imageId && row.imagePath && !dish.images.some((i: any) => i.id === row.imageId)) {
      dish.images.push({
        id: row.imageId,
        uri: row.imagePath,
      });
    }

    return acc;
  }, []);

  return dishes ?? [];
};
