import React, { createContext, useContext, useState } from 'react';

interface NewRestaurantContextData {
  newRestaurantId: number | null;
  setNewRestaurantId: (id: number | null) => void;
}

const NewRestaurantContext = createContext<NewRestaurantContextData | undefined>(undefined);

export const NewRestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [newRestaurantId, setNewRestaurantId] = useState<number | null>(null);
  return (
    <NewRestaurantContext.Provider value={{ newRestaurantId, setNewRestaurantId }}>
      {children}
    </NewRestaurantContext.Provider>
  );
};

export const useNewRestaurant = () => {
  const context = useContext(NewRestaurantContext);
  if (!context) {
    throw new Error('useNewRestaurant must be used within a TempRestaurantProvider');
  }
  return context;
};
