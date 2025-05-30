import { useEffect, useContext } from 'react';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/lib/context/AuthContext';

export default function Index() {
  const { userToken, loading, isOfflineMode } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (userToken || isOfflineMode) {
        router.replace('/restaurants');
      } else {
        router.replace('/login');
      }
    }
  }, [userToken, loading]);

  return null;
}