import React, { createContext, useContext, useState } from 'react';

interface NewDishContextData {
  newDishId: number | null;
  setNewDishId: (id: number | null) => void;
}

const NewDishContext = createContext<NewDishContextData | undefined>(undefined);

export const NewDishProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [newDishId, setNewDishId] = useState<number | null>(null);
  return (
    <NewDishContext.Provider value={{ newDishId, setNewDishId }}>
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
