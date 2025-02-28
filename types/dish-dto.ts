import { ImageDTO } from "./image-dto";
import { TagDTO } from "./tag-dto";

export interface DishDTO {
  id: string;
  name: string;
  comments: string;
  rating: number;
  tags: TagDTO[];
  images: ImageDTO[];
}