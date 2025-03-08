import { ImageDTO } from '@/features/images/types/image-dto'
import { RestaurantDetailsDTO } from '@/features/restaurants/types/restaurant-dto';

export interface VisitDTO {
  id: string;
  visited_at: string;
  comments: string;
  restaurant: RestaurantDetailsDTO;
  images: ImageDTO[];
}
