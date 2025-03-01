import { Slot } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { NewRestaurantProvider } from '@/context/NewRestaurantContext';
import "../global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <NewRestaurantProvider>
        <Slot />
      </NewRestaurantProvider>
    </AuthProvider>
  );
}