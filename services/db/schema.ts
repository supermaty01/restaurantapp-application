import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

// Tabla de usuarios
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
});

// Tabla de restaurantes
export const restaurants = sqliteTable('restaurants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  location: text('location'),
  comments: text('comments'),
  rating: integer('rating'),
  userId: text('user_id').references(() => users.id),
});

// Tabla de visitas
export const visits = sqliteTable('visits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  visitedAt: text('visited_at').notNull(),
  comments: text('comments'),
  restaurantId: text('restaurant_id').references(() => restaurants.id),
  userId: text('user_id').references(() => users.id),
});

// Tabla de platos
export const dishes = sqliteTable('dishes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  price: integer('price'),
  rating: integer('rating'),
  comments: text('comments'),
  restaurantId: text('restaurant_id').references(() => restaurants.id),
  userId: text('user_id').references(() => users.id),
});

// Tabla de etiquetas
export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color').notNull(),
  userId: text('user_id').references(() => users.id),
});

// Relaciones de etiquetas con restaurantes
export const restaurantTags = sqliteTable('restaurant_tag', {
  restaurantId: text('restaurant_id').references(() => restaurants.id),
  tagId: text('tag_id').references(() => tags.id),
}, (table) => [
  primaryKey({ columns: [table.restaurantId, table.tagId] }),
]);

// Relaciones de etiquetas con platos
export const dishTags = sqliteTable('dish_tag', {
  dishId: text('dish_id').references(() => dishes.id),
  tagId: text('tag_id').references(() => tags.id),
}, (table) => [
  primaryKey({ columns: [table.dishId, table.tagId] }),
]);

// Relación de visitas con platos
export const dishVisits = sqliteTable('dish_visit', {
  visitId: text('visit_id').references(() => visits.id),
  dishId: text('dish_id').references(() => dishes.id),
}, (table) => [
  primaryKey({ columns: [table.visitId, table.dishId] }),
]);
