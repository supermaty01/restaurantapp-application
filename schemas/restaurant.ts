import { z } from "zod";

export const restaurantSchema = z.object({
  name: z.string().nonempty('El nombre es requerido'),
  comments: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

export type RestaurantFormData = z.infer<typeof restaurantSchema>;