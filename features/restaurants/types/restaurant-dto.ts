import { ImageDTO } from "./image-dto";
import { TagDTO } from "./tag-dto";

export interface RestaurantDetailsDTO {
  id: number;
  name: string;
  comments: string | null;
  rating: number | null;
  tags: TagDTO[];
  images: ImageDTO[];
  location?: { latitude: number; longitude: number } | null;
}

export interface RestaurantListDTO {
  id: number;
  name: string;
  comments: string | null;
  rating: number | null;
  tags: TagDTO[];
}