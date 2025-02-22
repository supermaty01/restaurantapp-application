import React, { useContext, useEffect } from 'react';
import { Stack, Slot, useRouter } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';

export default function MainLayout() {
  const { userToken, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !userToken) {
      router.replace('/login');
    }
  }, [userToken, loading, router]);

  if (loading || !userToken) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Slot />
    </Stack>
  );
}
