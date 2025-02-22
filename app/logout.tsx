import { useEffect, useContext } from 'react';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';

export default function Logout() {
  const { logout } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    async function performLogout() {
      await logout();
      router.replace('/login');
    }
    performLogout();
  }, []);

  return null;
}
