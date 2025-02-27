import React, { useContext, useEffect } from 'react';
import { TouchableOpacity, Image, View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '@/context/AuthContext';

import RestaurantsScreen from './restaurants';
import DishesScreen from './dishes';
import VisitsScreen from './visits';
import TagsScreen from './tags';
import NewRestaurantScreen from './restaurants/new';
import RestaurantDetailScreen from './restaurants/[id]/view';
import RestaurantEditScreen from './restaurants/[id]/edit';

const TopTab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

function TabsLayout() {
  return (
    <TopTab.Navigator
      screenOptions={{
        swipeEnabled: true,
        tabBarIndicatorStyle: { backgroundColor: '#905c36' },
        tabBarActiveTintColor: '#905c36',
        tabBarInactiveTintColor: '#6b6246',
        tabBarStyle: { backgroundColor: '#cdc8b8' },
        tabBarLabelStyle: { fontSize: 11 },
      }}
      tabBarPosition="bottom"
    >
      <TopTab.Screen
        name="restaurants"
        component={RestaurantsScreen}
        options={{
          title: 'Restaurantes',
          tabBarIcon: ({ color }) => (
            <Ionicons name="restaurant-outline" size={24} color={color} />
          ),
        }}
      />
      <TopTab.Screen
        name="dishes"
        component={DishesScreen}
        options={{
          title: 'Platos',
          tabBarIcon: ({ color }) => (
            <Ionicons name="fast-food-outline" size={24} color={color} />
          ),
        }}
      />
      <TopTab.Screen
        name="visits"
        component={VisitsScreen}
        options={{
          title: 'Visitas',
          tabBarIcon: ({ color }) => (
            <Ionicons name="eye-outline" size={24} color={color} />
          ),
        }}
      />
      <TopTab.Screen
        name="tags"
        component={TagsScreen}
        options={{
          title: 'Etiquetas',
          tabBarIcon: ({ color }) => (
            <Ionicons name="pricetag-outline" size={24} color={color} />
          ),
        }}
      />
    </TopTab.Navigator>
  );
}

type CustomHeaderProps = {
  navigation: any;
  route: any;
};

const CustomHeader: React.FC<CustomHeaderProps> = ({ navigation, route }) => {
  return (
    <View className="w-full flex-row items-center justify-between p-4 bg-[#e3e6d6]">
      <View className="w-20">
        {route.name !== 'Tabs' && (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={24} color="#905c36" />
          </TouchableOpacity>
        )}
      </View>
      <Image
        source={require('@/assets/burger-logo.png')}
        className="w-12 h-12"
      />
      <View className="w-20 items-end">
        <TouchableOpacity
          onPress={async () => {
            await logout();
            router.replace('/login');
          }}
        >
          <Ionicons name="log-out-outline" size={32} color="#905c36" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

let logout: () => Promise<void>;
let router: ReturnType<typeof useRouter>;

export default function MainLayout() {
  const { userToken, loading, logout: contextLogout } = useContext(AuthContext);
  router = useRouter();
  logout = contextLogout;

  useEffect(() => {
    if (!loading && !userToken) {
      router.replace('/login');
    }
  }, [userToken, loading, router]);

  if (loading || !userToken) return null;

  return (
    <SafeAreaView className="flex-1 bg-[#e5eae0]">
      <StatusBar style="dark" backgroundColor="#e3e6d6" />
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          header: ({ navigation, route }) => (
            <CustomHeader navigation={navigation} route={route} />
          ),
        }}
      >
        {/* Pantalla principal de listas: se oculta la flecha (nombre "Tabs") */}
        <Stack.Screen
          name="Tabs"
          component={TabsLayout}
          options={{ headerShown: true }}
        />
        {/* Pantalla para añadir restaurante u otras: se mostrará la flecha */}
        <Stack.Screen
          name="restaurants/new"
          component={NewRestaurantScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="restaurants/[id]/view"
          component={RestaurantDetailScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="restaurants/[id]/edit"
          component={RestaurantEditScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </SafeAreaView>
  );
}
