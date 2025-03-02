import { z } from "zod";

export const visitSchema = z.object({
  visited_at: z.string().nonempty('La fecha de la visita es requerida'),
  comments: z.string().optional(),
  restaurant_id: z.string({required_error: 'Debes seleccionar un restaurante'}),
  dishes: z.array(z.string()).min(1, 'Debes seleccionar al menos un plato'),
});

export type VisitFormData = z.infer<typeof visitSchema>;
