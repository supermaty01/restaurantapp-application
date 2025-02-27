import { ImageDTO } from "./image-dto";
import { TagDTO } from "./tag-dto";

export interface RestaurantDTO {
  id: string;
  name: string;
  comments: string;
  rating: number;
  tags: TagDTO[];
  images: ImageDTO[];
  location: { latitude: number; longitude: number } | null;
}