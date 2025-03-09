import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "@/services/db/schema";
import { eq } from "drizzle-orm";
import { RestaurantDetailsDTO } from "../types/restaurant-dto";

export const useRestaurantById = (id: number) => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const { data: rawData } = useLiveQuery(drizzleDb
    .select({
      restaurantId: schema.restaurants.id,
      restaurantName: schema.restaurants.name,
      restaurantComments: schema.restaurants.comments,
      restaurantRating: schema.restaurants.rating,
      restaurantLatitude: schema.restaurants.latitude,
      restaurantLongitude: schema.restaurants.longitude,
      tagId: schema.tags.id,
      tagName: schema.tags.name,
      tagColor: schema.tags.color,
      imageId: schema.images.id,
      imagePath: schema.images.path,
    })
    .from(schema.restaurants)
    .leftJoin(schema.restaurantTags, eq(schema.restaurants.id, schema.restaurantTags.restaurantId))
    .leftJoin(schema.tags, eq(schema.restaurantTags.tagId, schema.tags.id))
    .leftJoin(schema.images, eq(schema.restaurants.id, schema.images.restaurantId))
    .where(eq(schema.restaurants.id, id))
  );

  const restaurant = rawData?.reduce<RestaurantDetailsDTO[]>((acc, row) => {
    let restaurant = acc.find((r) => r.id === row.restaurantId);
    if (!restaurant) {
      restaurant = {
        id: row.restaurantId,
        name: row.restaurantName,
        comments: row.restaurantComments,
        rating: row.restaurantRating,
        latitude: row.restaurantLatitude,
        longitude: row.restaurantLongitude,
        tags: [],
        images: [],
      };
      acc.push(restaurant);
    }

    // Agregar tags
    if (row.tagId && !restaurant.tags.some((t) => t.id === row.tagId)) {
      restaurant.tags.push({
        id: row.tagId,
        name: row.tagName!,
        color: row.tagColor!,
      });
    }

    // Agregar imágenes
    if (row.imageId && !restaurant.images.some((i) => i.id === row.imageId)) {
      restaurant.images.push({
        id: row.imageId,
        uri: row.imagePath!,
      });
    }

    return acc;
  }, []);

  return restaurant?.[0];
};
