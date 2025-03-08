import { DishListDTO } from '@/types/dish-dto';
import React, { createContext, useContext, useState } from 'react';

interface NewDishContextData {
  newDish: DishListDTO | null;
  setNewDish: (id: DishListDTO | null) => void;
}

const NewDishContext = createContext<NewDishContextData | undefined>(undefined);

export const NewDishProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [newDish, setNewDish] = useState<DishListDTO | null>(null);
  return (
    <NewDishContext.Provider value={{ newDish, setNewDish }}>
      {children}
    </NewDishContext.Provider>
  );
};

export const useNewDish = () => {
  const context = useContext(NewDishContext);
  if (!context) {
    throw new Error('useNewDish must be used within a TempRestaurantProvider');
  }
  return context;
};
