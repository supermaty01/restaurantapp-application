import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '@/services/db/schema';
import { eq } from 'drizzle-orm';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextData {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

export const ThemeContext = createContext<ThemeContextData>({
  themeMode: 'system',
  isDarkMode: false,
  setThemeMode: async () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  // Load theme preference from database
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const result = await drizzleDb.select()
          .from(schema.appSettings)
          .where(eq(schema.appSettings.key, 'themeMode'));
        
        if (result.length > 0 && result[0].value) {
          const savedMode = result[0].value as ThemeMode;
          setThemeModeState(savedMode);
          
          // Set dark mode based on preference or system
          if (savedMode === 'system') {
            setIsDarkMode(systemColorScheme === 'dark');
          } else {
            setIsDarkMode(savedMode === 'dark');
          }
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };
    
    loadThemePreference();
  }, []);

  // Update dark mode when system theme changes (if using system preference)
  useEffect(() => {
    if (themeMode === 'system') {
      setIsDarkMode(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, themeMode]);

  // Save theme preference to database
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await drizzleDb
        .insert(schema.appSettings)
        .values({
          key: 'themeMode',
          value: mode,
          updatedAt: new Date().toISOString(),
        })
        .onConflictDoUpdate({
          target: schema.appSettings.key,
          set: {
            value: mode,
            updatedAt: new Date().toISOString(),
          },
        });
      
      setThemeModeState(mode);
      
      // Update dark mode based on new preference
      if (mode === 'system') {
        setIsDarkMode(systemColorScheme === 'dark');
      } else {
        setIsDarkMode(mode === 'dark');
      }
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ themeMode, isDarkMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
