import React, { createContext, useContext, useState, useCallback } from 'react';

interface PeekContextType {
  isPeeking: boolean;
  setIsPeeking: (value: boolean) => void;
}

const PeekContext = createContext<PeekContextType>({
  isPeeking: false,
  setIsPeeking: () => {},
});

export const PeekProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPeeking, setIsPeeking] = useState(false);

  return (
    <PeekContext.Provider value={{ isPeeking, setIsPeeking }}>
      {children}
    </PeekContext.Provider>
  );
};

export const usePeek = () => useContext(PeekContext);

