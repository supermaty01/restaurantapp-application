import { View, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Slot } from 'expo-router';
import { useTheme } from '@/lib/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthLayout() {
  const { isDarkMode } = useTheme();
  return (
    <SafeAreaView className="flex-1 bg-muted dark:bg-dark-muted">
      <StatusBar style={isDarkMode ? "light" : "dark"} backgroundColor={isDarkMode ? "#111c16" : "#e3e6d6"} />
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
    </SafeAreaView>
  );
}
