import React, { Suspense, useState, createContext } from 'react';
import { Slot } from 'expo-router';
import { SQLiteProvider, openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/drizzle/migrations';
import { ActivityIndicator } from 'react-native';
import "../global.css";
import { AuthProvider } from '@/lib/context/AuthContext';
import { NewDishProvider } from '@/lib/context/NewDishContext';
import { NewRestaurantProvider } from '@/lib/context/NewRestaurantContext';
import { ThemeProvider } from '@/lib/context/ThemeContext';

export const DATABASE_NAME = 'restaurantapp';

// Contexto para exponer la función que “bump” la versión de la BBDD
export const DBVersionContext = createContext<() => void>(() => { });

export default function RootLayout() {
  // Cada vez que incrementemos dbVersion, forzamos el remount de SQLiteProvider
  const [dbVersion, setDbVersion] = useState(0);

  const expoDb = openDatabaseSync(DATABASE_NAME);
  const db = drizzle(expoDb);
  useMigrations(db, migrations);

  return (
    <DBVersionContext.Provider value={() => setDbVersion(v => v + 1)}>
      <Suspense fallback={<ActivityIndicator size="large" color="#905c36" />}>
        <SQLiteProvider
          // El key basado en dbVersion desencadena un unmount+remount
          key={dbVersion}
          databaseName={DATABASE_NAME}
          options={{ enableChangeListener: true }}
          useSuspense
        >
          <AuthProvider>
            <ThemeProvider>
              <NewRestaurantProvider>
                <NewDishProvider>
                  <Slot />
                </NewDishProvider>
              </NewRestaurantProvider>
            </ThemeProvider>
          </AuthProvider>
        </SQLiteProvider>
      </Suspense>
    </DBVersionContext.Provider>
  );
}
