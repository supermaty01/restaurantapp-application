import { View, Image } from 'react-native';
import { Slot } from 'expo-router';
import { useTheme } from '@/lib/context/ThemeContext';

export default function AuthLayout() {
  const { isDarkMode } = useTheme();
  return (
    <View className="flex-1 bg-muted dark:bg-dark-muted">
      <View className="flex-1 px-5 py-8 items-center justify-center">
        <Image
          source={require('@/assets/burger-logo.png')}
          className="mb-6"
          style={{ width: 128, height: 128 }}
        />
        <Slot />
      </View>
    </View>
  );
}
