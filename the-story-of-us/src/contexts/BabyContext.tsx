import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Doc } from '../../convex/_generated/dataModel';
import { getOrCreateAnonymousId } from '../utils/anonymousId';

interface BabyContextType {
  babies: Doc<"babies">[] | undefined;
  selectedBaby: Doc<"babies"> | undefined;
  isLoading: boolean;
  selectBaby: (baby: Doc<"babies">) => void;
}

const BabyContext = createContext<BabyContextType | undefined>(undefined);

export const BabyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);

  // Get anonymous ID once
  useEffect(() => {
    getOrCreateAnonymousId().then(setAnonymousId);
  }, []);

  // Query babies only once here
  const babies = useQuery(
    api.babies.getBabies,
    anonymousId ? { anonymousId } : 'skip'
  );

  const selectedBaby = babies?.find(b => b._id === selectedBabyId) || babies?.[0];

  const selectBaby = (baby: Doc<"babies">) => {
    setSelectedBabyId(baby._id);
  };

  return (
    <BabyContext.Provider
      value={{
        babies,
        selectedBaby,
        isLoading: !babies && !!anonymousId,
        selectBaby,
      }}
    >
      {children}
    </BabyContext.Provider>
  );
};

export const useBaby = () => {
  const context = useContext(BabyContext);
  if (!context) {
    throw new Error('useBaby must be used within BabyProvider');
  }
  return context;
};