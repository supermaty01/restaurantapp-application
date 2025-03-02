import { ImageDTO } from "./image-dto";
import { TagDTO } from "./tag-dto";

export interface DishDTO {
  id: number;
  name: string;
  comments: string;
  restaurant: {
    id: number;
    name: string;
  };
  price?: number;
  rating?: number;
  tags?: TagDTO[];
  images?: ImageDTO[];
} 