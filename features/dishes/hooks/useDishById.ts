import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "@/services/db/schema";
import { and, eq } from "drizzle-orm";
import { DishDetailsDTO } from "../types/dish-dto";
import { useLiveTablesQuery } from "@/lib/hooks/useLiveTablesQuery";

export const useDishById = (id: number, includeDeleted: boolean = true) => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const query = drizzleDb
    .select({
      dishId: schema.dishes.id,
      dishName: schema.dishes.name,
      dishComments: schema.dishes.comments,
      dishRating: schema.dishes.rating,
      dishPrice: schema.dishes.price,
      dishDeleted: schema.dishes.deleted,
      tagId: schema.tags.id,
      tagName: schema.tags.name,
      tagColor: schema.tags.color,
      imageId: schema.images.id,
      imagePath: schema.images.path,
      restaurantId: schema.restaurants.id,
      restaurantName: schema.restaurants.name,
      restaurantDeleted: schema.restaurants.deleted,
    })
    .from(schema.dishes);

  // Filtrar por ID y, opcionalmente, por estado de eliminación
  if (includeDeleted) {
    query.where(eq(schema.dishes.id, id));
  } else {
    query.where(and(eq(schema.dishes.id, id), eq(schema.dishes.deleted, false)));
  }

  query.leftJoin(schema.restaurants, eq(schema.dishes.restaurantId, schema.restaurants.id))
      .leftJoin(schema.dishTags, eq(schema.dishes.id, schema.dishTags.dishId))
      .leftJoin(schema.tags, eq(schema.dishTags.tagId, schema.tags.id))
      .leftJoin(schema.images, eq(schema.dishes.id, schema.images.dishId));

  const { data: rawData } = useLiveTablesQuery(query
    , ["dishes", "dishTags", "tags", "images", "restaurants"]);

    const dishes = rawData?.reduce<DishDetailsDTO[]>((acc, row) => {
      let dish = acc.find((r) => r.id === row.dishId);
      if (!dish) {
        dish = {
          id: row.dishId,
          name: row.dishName,
          comments: row.dishComments,
          rating: row.dishRating,
          price: row.dishPrice,
          deleted: row.dishDeleted,
          restaurant: {
            id: row.restaurantId!,
            name: row.restaurantName!,
            deleted: row.restaurantDeleted,
          },
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

  return dishes?.[0];
};
