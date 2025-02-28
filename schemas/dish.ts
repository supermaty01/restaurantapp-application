import { z } from "zod";

export const dishSchema = z.object({
  name: z.string().nonempty('El nombre es requerido'),
  restaurant_id: z.coerce.number().positive('Selecciona un restaurante'),
  comments: z.string().optional(),
  price: z.coerce.number().positive('El precio debe ser mayor que 0').or(
    z.string().transform((val) => {
      // Replace comma with dot for decimal separator if needed
      const normalized = val.replace(',', '.');
      const parsed = parseFloat(normalized);
      if (isNaN(parsed)) {
        throw new Error('El precio debe ser un número válido');
      }
      return parsed;
    })
  ),
  rating: z.number().min(1).max(5).optional(),
});

export type DishFormData = z.infer<typeof dishSchema>;