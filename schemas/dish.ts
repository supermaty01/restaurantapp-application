import { z } from "zod";

export const dishSchema = z.object({
  name: z.string().nonempty('El nombre es requerido'),
  comments: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

export type DishFormData = z.infer<typeof dishSchema>;