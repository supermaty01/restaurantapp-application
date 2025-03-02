import { RestaurantDetailsDTO } from '@/types/restaurant-dto'
import { ImageDTO } from '@/types/image-dto'

export interface VisitDTO {
  id: string;
  visited_at: string;
  comments: string;
  restaurant: RestaurantDetailsDTO;
  images: ImageDTO[];
}
