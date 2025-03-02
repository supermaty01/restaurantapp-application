import { ImageDTO } from "./image-dto";
import { TagDTO } from "./tag-dto";


export interface DishDetailsDTO {
  id: number;
  name: string;
  comments: string | null;
  restaurant: {
    id: number;
    name: string;
  };
  price: number | null;
  rating: number | null;
  tags: TagDTO[];
  images: ImageDTO[];
} 

export interface DishListDTO {
  id: number;
  name: string;
  comments: string | null;
  rating: number | null;
  tags: TagDTO[];
  images: ImageDTO[];
}
