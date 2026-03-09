import React, { createContext, useContext, useState, useMemo } from 'react';

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

  const value = useMemo(() => ({ isPeeking, setIsPeeking }), [isPeeking]);

  return (
    <PeekContext.Provider value={value}>
      {children}
    </PeekContext.Provider>
  );
};

export const usePeek = () => useContext(PeekContext);

