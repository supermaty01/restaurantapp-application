import { Slot } from 'expo-router';
import { SQLiteProvider, openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/drizzle/migrations';
import "../global.css";
import { Suspense } from 'react';
import { ActivityIndicator } from 'react-native';
import { AuthProvider } from '@/lib/context/AuthContext';
import { NewDishProvider } from '@/lib/context/NewDishContext';
import { NewRestaurantProvider } from '@/lib/context/NewRestaurantContext';

export const DATABASE_NAME = 'restaurantapp';

export default function RootLayout() {
  const expoDb = openDatabaseSync(DATABASE_NAME);
  const db = drizzle(expoDb);
  useMigrations(db, migrations);

  return (
    <Suspense fallback={<ActivityIndicator size="large" color="#905c36" />}>
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        options={{ enableChangeListener: true }}
        useSuspense>
        <AuthProvider>
          <NewRestaurantProvider>
            <NewDishProvider>
              <Slot />
            </NewDishProvider>
          </NewRestaurantProvider>
        </AuthProvider>
      </SQLiteProvider>
    </Suspense>
  );
}