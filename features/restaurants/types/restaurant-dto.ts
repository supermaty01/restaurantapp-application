import { ImageDTO } from "@/features/images/types/image-dto";
import { TagDTO } from "@/features/tags/types/tag-dto";

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