import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Tabla de usuarios
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
});

// Tabla de restaurantes
export const restaurants = sqliteTable('restaurants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  latitude: real('latitude'),
  longitude: real('longitude'),
  comments: text('comments'),
  rating: integer('rating'),
  userId: integer('user_id').references(() => users.id),
});

// Tabla de visitas
export const visits = sqliteTable('visits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  visitedAt: text('visited_at').notNull(),
  comments: text('comments'),
  restaurantId: integer('restaurant_id').references(() => restaurants.id),
  userId: integer('user_id').references(() => users.id),
});

// Tabla de platos
export const dishes = sqliteTable('dishes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  price: integer('price'),
  rating: integer('rating'),
  comments: text('comments'),
  restaurantId: integer('restaurant_id').references(() => restaurants.id),
  userId: integer('user_id').references(() => users.id),
});

// Tabla de etiquetas
export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color').notNull(),
  userId: integer('user_id').references(() => users.id),
});

// Relaciones de etiquetas con restaurantes (Many-to-Many)
export const restaurantTags = sqliteTable('restaurant_tag', {
  restaurantId: integer('restaurant_id').references(() => restaurants.id),
  tagId: integer('tag_id').references(() => tags.id),
}, (table) => [
  primaryKey({ columns: [table.restaurantId, table.tagId] }),
]);

// Relaciones de etiquetas con platos (Many-to-Many)
export const dishTags = sqliteTable('dish_tag', {
  dishId: integer('dish_id').references(() => dishes.id),
  tagId: integer('tag_id').references(() => tags.id),
}, (table) => [
  primaryKey({ columns: [table.dishId, table.tagId] }),
]);

// Relación de visitas con platos (Many-to-Many)
export const dishVisits = sqliteTable('dish_visit', {
  visitId: integer('visit_id').references(() => visits.id),
  dishId: integer('dish_id').references(() => dishes.id),
}, (table) => [
  primaryKey({ columns: [table.visitId, table.dishId] }),
]);

// Definición de relaciones con Drizzle
export const usersRelations = relations(users, ({ many }) => ({
  restaurants: many(restaurants),
  visits: many(visits),
  dishes: many(dishes),
  tags: many(tags),
}));

export const restaurantsRelations = relations(restaurants, ({ one, many }) => ({
  user: one(users, { fields: [restaurants.userId], references: [users.id] }),
  visits: many(visits),
  dishes: many(dishes),
  tags: many(restaurantTags),
}));

export const visitsRelations = relations(visits, ({ one, many }) => ({
  user: one(users, { fields: [visits.userId], references: [users.id] }),
  restaurant: one(restaurants, { fields: [visits.restaurantId], references: [restaurants.id] }),
  dishes: many(dishVisits),
}));

export const dishesRelations = relations(dishes, ({ one, many }) => ({
  user: one(users, { fields: [dishes.userId], references: [users.id] }),
  restaurant: one(restaurants, { fields: [dishes.restaurantId], references: [restaurants.id] }),
  tags: many(dishTags),
  visits: many(dishVisits),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, { fields: [tags.userId], references: [users.id] }),
  restaurantTags: many(restaurantTags),
  dishTags: many(dishTags),
}));
