import { Slot } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { NewRestaurantProvider } from '@/context/NewRestaurantContext';
import { NewDishProvider } from '@/context/NewDishContext';
import "../global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <NewRestaurantProvider>
        <NewDishProvider>
          <Slot />
        </NewDishProvider>
      </NewRestaurantProvider>
    </AuthProvider>
  );
}