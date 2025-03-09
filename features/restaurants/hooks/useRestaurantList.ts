import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "@/services/db/schema";
import { eq } from "drizzle-orm";
import { RestaurantListDTO } from "../types/restaurant-dto";

export const useRestaurantList = () => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const { data: rawData } = useLiveQuery(drizzleDb
    .select({
      restaurantId: schema.restaurants.id,
      restaurantName: schema.restaurants.name,
      restaurantComments: schema.restaurants.comments,
      restaurantRating: schema.restaurants.rating,
      tagId: schema.tags.id,
      tagName: schema.tags.name,
      tagColor: schema.tags.color,
    })
    .from(schema.restaurants)
    .leftJoin(schema.restaurantTags, eq(schema.restaurants.id, schema.restaurantTags.restaurantId))
    .leftJoin(schema.tags, eq(schema.restaurantTags.tagId, schema.tags.id))
  );

  const restaurants = rawData?.reduce<RestaurantListDTO[]>((acc, row) => {
    let restaurant = acc.find((r) => r.id === row.restaurantId);
    if (!restaurant) {
      restaurant = {
        id: row.restaurantId,
        name: row.restaurantName,
        comments: row.restaurantComments,
        rating: row.restaurantRating,
        tags: [] 
      };
      acc.push(restaurant);
    }

    if (row.tagId) {
      restaurant.tags.push({
        id: row.tagId,
        name: row.tagName!,
        color: row.tagColor!,
      });
    }

    return acc;
  }, []);

  return restaurants ?? [];
};
