import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex items-center justify-center h-full bg-gray-100">
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Link href="/login" className="text-blue-500">Go to login</Link>
    </View>
  );
}
