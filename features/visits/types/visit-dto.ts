import { ImageDTO } from '@/features/images/types/image-dto'
import { RestaurantDetailsDTO } from '@/features/restaurants/types/restaurant-dto';

export interface DishBasicDTO {
  id: number;
  name: string;
}

export interface VisitDetailsDTO {
  id: number;
  visited_at: string;
  comments: string | null;
  restaurant: {
    id: number;
    name: string;
  };
  images: ImageDTO[];
  dishes: DishBasicDTO[];
}

export interface VisitListDTO {
  id: number;
  visited_at: string;
  comments: string | null;
  restaurant: {
    id: number;
    name: string;
  };
  images: ImageDTO[];
}

// Mantener para compatibilidad con código existente
export interface VisitDTO {
  id: string;
  visited_at: string;
  comments: string;
  restaurant: RestaurantDetailsDTO;
  images: ImageDTO[];
}
