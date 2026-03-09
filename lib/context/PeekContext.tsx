import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import PeekOverlay from '@/components/peek/PeekOverlay';
import { PeekSession } from '@/components/peek/types';

interface PeekContextType {
  isPeeking: boolean;
  activeSession: PeekSession | null;
  beginPeek: (session: PeekSession) => void;
  endPeek: () => void;
}

const PeekContext = createContext<PeekContextType>({
  isPeeking: false,
  activeSession: null,
  beginPeek: () => {},
  endPeek: () => {},
});

export const PeekProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPeeking, setIsPeeking] = useState(false);
  const [activeSession, setActiveSession] = useState<PeekSession | null>(null);

  const beginPeek = useCallback((session: PeekSession) => {
    setActiveSession(session);
    setIsPeeking(true);
  }, []);

  const endPeek = useCallback(() => {
    setIsPeeking(false);
    setActiveSession(null);
  }, []);

  const value = useMemo(
    () => ({
      isPeeking,
      activeSession,
      beginPeek,
      endPeek,
    }),
    [activeSession, beginPeek, endPeek, isPeeking]
  );

  return (
    <PeekContext.Provider value={value}>
      {children}
      <PeekOverlay activeSession={activeSession} isPeeking={isPeeking} />
    </PeekContext.Provider>
  );
};

export const usePeek = () => useContext(PeekContext);

