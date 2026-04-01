/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Encounter, MyCatProfile, DexEntry } from '../types/domain';
import { apiService } from '../services/api';

interface AppContextType {
  encounters: Encounter[];
  myCats: MyCatProfile[];
  dex: DexEntry[];
  isLoading: boolean;
  addEncounter: (encounter: Encounter) => void;
  updateMyCat: (cat: MyCatProfile) => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [myCats, setMyCats] = useState<MyCatProfile[]>([]);
  const [dex, setDex] = useState<DexEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Load from localStorage first if available
      const savedEncounters = localStorage.getItem('nekolog_encounters');
      const savedCats = localStorage.getItem('nekolog_mycats');
      const savedDex = localStorage.getItem('nekolog_dex');

      if (savedEncounters && savedCats && savedDex) {
        setEncounters(JSON.parse(savedEncounters));
        setMyCats(JSON.parse(savedCats));
        setDex(JSON.parse(savedDex));
      } else {
        // Otherwise load from mock API
        const [timelineData, catsData, dexData] = await Promise.all([
          apiService.getTimeline(),
          apiService.getMyCats(),
          apiService.getDex(),
        ]);
        setEncounters(timelineData);
        setMyCats(catsData);
        setDex(dexData);
        
        // Save initial mock data to localStorage
        localStorage.setItem('nekolog_encounters', JSON.stringify(timelineData));
        localStorage.setItem('nekolog_mycats', JSON.stringify(catsData));
        localStorage.setItem('nekolog_dex', JSON.stringify(dexData));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addEncounter = (encounter: Encounter) => {
    const updatedEncounters = [encounter, ...encounters];
    setEncounters(updatedEncounters);
    localStorage.setItem('nekolog_encounters', JSON.stringify(updatedEncounters));
  };

  const updateMyCat = (cat: MyCatProfile) => {
    const updatedCats = myCats.map(c => c.id === cat.id ? cat : c);
    setMyCats(updatedCats);
    localStorage.setItem('nekolog_mycats', JSON.stringify(updatedCats));
  };

  return (
    <AppContext.Provider value={{ 
      encounters, 
      myCats, 
      dex, 
      isLoading, 
      addEncounter, 
      updateMyCat,
      refreshData 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
