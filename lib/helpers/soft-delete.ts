import { DrizzleDatabase } from '@/services/db/types';
import * as schema from '@/services/db/schema';
import { and, eq, count } from 'drizzle-orm';

/**
 * Verifica si un restaurante puede ser eliminado permanentemente
 * @param db Instancia de la base de datos
 * @param restaurantId ID del restaurante
 * @returns true si puede ser eliminado permanentemente, false si debe ser soft delete
 */
export async function canDeleteRestaurantPermanently(db: DrizzleDatabase, restaurantId: number): Promise<boolean> {
  // Verificar si hay platos asociados al restaurante
  const dishesCount = await db
    .select({ count: count() })
    .from(schema.dishes)
    .where(eq(schema.dishes.restaurantId, restaurantId));

  // Verificar si hay visitas asociadas al restaurante
  const visitsCount = await db
    .select({ count: count() })
    .from(schema.visits)
    .where(eq(schema.visits.restaurantId, restaurantId));

  // Si no hay platos ni visitas, se puede eliminar permanentemente
  return dishesCount[0].count === 0 && visitsCount[0].count === 0;
}

/**
 * Verifica si un plato puede ser eliminado permanentemente
 * @param db Instancia de la base de datos
 * @param dishId ID del plato
 * @returns true si puede ser eliminado permanentemente, false si debe ser soft delete
 */
export async function canDeleteDishPermanently(db: DrizzleDatabase, dishId: number): Promise<boolean> {
  // Verificar si hay visitas asociadas al plato
  const dishVisitsCount = await db
    .select({ count: count() })
    .from(schema.dishVisits)
    .where(eq(schema.dishVisits.dishId, dishId));

  // Si no hay visitas, se puede eliminar permanentemente
  return dishVisitsCount[0].count === 0;
}

/**
 * Verifica si una etiqueta puede ser eliminada permanentemente
 * @param db Instancia de la base de datos
 * @param tagId ID de la etiqueta
 * @returns true si puede ser eliminada permanentemente, false si debe ser soft delete
 */
export async function canDeleteTagPermanently(db: DrizzleDatabase, tagId: number): Promise<boolean> {
  // Verificar si hay restaurantes asociados a la etiqueta
  const restaurantTagsCount = await db
    .select({ count: count() })
    .from(schema.restaurantTags)
    .where(eq(schema.restaurantTags.tagId, tagId));

  // Verificar si hay platos asociados a la etiqueta
  const dishTagsCount = await db
    .select({ count: count() })
    .from(schema.dishTags)
    .where(eq(schema.dishTags.tagId, tagId));

  // Si no hay restaurantes ni platos, se puede eliminar permanentemente
  return restaurantTagsCount[0].count === 0 && dishTagsCount[0].count === 0;
}

/**
 * Verifica si una visita puede ser eliminada permanentemente
 * @param db Instancia de la base de datos
 * @param visitId ID de la visita
 * @returns true si puede ser eliminada permanentemente, false si debe ser soft delete
 */
export async function canDeleteVisitPermanently(db: DrizzleDatabase, visitId: number): Promise<boolean> {
  // Las visitas siempre se pueden eliminar permanentemente ya que no son referenciadas por otras entidades
  return true;
}

/**
 * Realiza un soft delete de un restaurante
 * @param db Instancia de la base de datos
 * @param restaurantId ID del restaurante
 */
export async function softDeleteRestaurant(db: DrizzleDatabase, restaurantId: number): Promise<void> {
  await db
    .update(schema.restaurants)
    .set({ deleted: true })
    .where(eq(schema.restaurants.id, restaurantId));
}

/**
 * Realiza un soft delete de un plato
 * @param db Instancia de la base de datos
 * @param dishId ID del plato
 */
export async function softDeleteDish(db: DrizzleDatabase, dishId: number): Promise<void> {
  await db
    .update(schema.dishes)
    .set({ deleted: true })
    .where(eq(schema.dishes.id, dishId));
}

/**
 * Realiza un soft delete de una etiqueta
 * @param db Instancia de la base de datos
 * @param tagId ID de la etiqueta
 */
export async function softDeleteTag(db: DrizzleDatabase, tagId: number): Promise<void> {
  await db
    .update(schema.tags)
    .set({ deleted: true })
    .where(eq(schema.tags.id, tagId));
}

/**
 * Realiza un soft delete de una visita
 * @param db Instancia de la base de datos
 * @param visitId ID de la visita
 */
export async function softDeleteVisit(db: DrizzleDatabase, visitId: number): Promise<void> {
  await db
    .update(schema.visits)
    .set({ deleted: true })
    .where(eq(schema.visits.id, visitId));
}
