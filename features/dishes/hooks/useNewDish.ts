import { NewDishContext } from "@/lib/context/NewDishContext";
import { useContext } from "react";

export const useNewDish = () => {
  const context = useContext(NewDishContext);
  if (!context) {
    throw new Error('useNewDish must be used within a NewDishProvider');
  }
  return context;
};