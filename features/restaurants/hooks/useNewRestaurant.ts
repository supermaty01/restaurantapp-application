import { NewRestaurantContext } from "@/lib/context/NewRestaurantContext";
import { useContext } from "react";

export const useNewRestaurant = () => {
  const context = useContext(NewRestaurantContext);
  if (!context) {
    throw new Error('useNewRestaurant must be used within a NewRestaurantProvider');
  }
  return context;
};