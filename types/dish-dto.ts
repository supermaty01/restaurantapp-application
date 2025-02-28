export interface DishDTO {
    id: string;
    name: string;
    description?: string; // Opcional, algunas API pueden no devolverlo
    price?: number; // Opcional, si los platos tienen precio
    rating?: number; // Opcional, si hay calificación de platos
    tags?: string[]; // Opcional, si los platos tienen etiquetas asociadas
  }
  