import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "@/services/db/schema";
import { and, eq } from "drizzle-orm";
import { RestaurantListDTO } from "../types/restaurant-dto";
import { useLiveTablesQuery } from "@/lib/hooks/useLiveTablesQuery";
import { imagePathToUri } from "@/lib/helpers/image-paths";

export const useRestaurantList = (includeDeleted: boolean = false) => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const query = drizzleDb
    .select({
      restaurantId: schema.restaurants.id,
      restaurantName: schema.restaurants.name,
      restaurantComments: schema.restaurants.comments,
      restaurantRating: schema.restaurants.rating,
      restaurantDeleted: schema.restaurants.deleted,
      tagId: schema.tags.id,
      tagName: schema.tags.name,
      tagColor: schema.tags.color,
      imageId: schema.images.id,
      imagePath: schema.images.path,
    })
    .from(schema.restaurants);

  // Si no se incluyen los eliminados, filtrarlos
  if (!includeDeleted) {
    query.where(eq(schema.restaurants.deleted, false));
  }

  query.leftJoin(schema.restaurantTags, eq(schema.restaurants.id, schema.restaurantTags.restaurantId))
      .leftJoin(schema.tags, eq(schema.restaurantTags.tagId, schema.tags.id))
      .leftJoin(schema.images, eq(schema.restaurants.id, schema.images.restaurantId));

  const { data: rawData } = useLiveTablesQuery(query
  , ["restaurants", "restaurantTags", "tags", "images"]);

  const restaurants = rawData?.reduce<RestaurantListDTO[]>((acc, row) => {
    let restaurant = acc.find((r) => r.id === row.restaurantId);
    if (!restaurant) {
      restaurant = {
        id: row.restaurantId,
        name: row.restaurantName,
        comments: row.restaurantComments,
        rating: row.restaurantRating,
        deleted: row.restaurantDeleted,
        tags: [],
        images: [],
      };
      acc.push(restaurant);
    }

    if (row.tagId && !restaurant.tags.some(t => t.id === row.tagId)) {
      restaurant.tags.push({
        id: row.tagId,
        name: row.tagName!,
        color: row.tagColor!,
      });
    }

    // Agregar imágenes
    if (row.imageId && row.imagePath && !restaurant.images.some(i => i.id === row.imageId)) {
      restaurant.images.push({
        id: row.imageId,
        uri: imagePathToUri(row.imagePath),
      });
    }

    return acc;
  }, []);

  return restaurants ?? [];
};
