import { View, Image } from 'react-native';
import { Slot } from 'expo-router';

export default function AuthLayout() {
  return (
    <View className="flex-1 bg-muted">
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
