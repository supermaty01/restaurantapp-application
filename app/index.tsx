import { useEffect, useContext } from 'react';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';

export default function Index() {
  const { userToken, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (userToken) {
        router.replace('/restaurants');
      } else {
        router.replace('/login');
      }
    }
  }, [userToken, loading]);

  return null;
}