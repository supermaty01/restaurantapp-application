import React, { useContext, useEffect } from 'react';
import { TouchableOpacity, Image, View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthContext } from '@/context/AuthContext';

import RestaurantsScreen from './restaurants';
import DishesScreen from './dishes';
import VisitsScreen from './visits';
import TagsScreen from './tags';

const TopTab = createMaterialTopTabNavigator();

export default function MainLayout() {
  const { userToken, loading, logout } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !userToken) {
      router.replace('/login');
    }
  }, [userToken, loading, router]);

  if (loading || !userToken) return null;

  return (
    <SafeAreaView className="flex-1">
      <StatusBar style="dark" backgroundColor="#e3e6d6" />
      <View className="w-full flex-row items-center justify-between p-4 bg-[#e3e6d6]">
        <View className="w-20" />
        <Image
          source={require('@/assets/burger-logo.png')}
          className="w-12 h-12"
        />
        <TouchableOpacity
          onPress={async () => {
            await logout();
            router.replace('/login');
          }}
          className="w-20 items-end"
        >
          <Ionicons name="log-out-outline" size={32} color="#905c36" />
        </TouchableOpacity>
      </View>

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
    </SafeAreaView>
  );
}
