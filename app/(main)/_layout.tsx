import React, { useContext, useEffect } from 'react';
import { TouchableOpacity, Image, View, Alert } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RestaurantsScreen from './restaurants';
import DishesScreen from './dishes';
import VisitsScreen from './visits';
import TagsScreen from './tags';
import RestaurantCreateScreen from './restaurants/new';
import RestaurantDetailScreen from './restaurants/[id]/view';
import RestaurantEditScreen from './restaurants/[id]/edit';
import DishCreateScreen from './dishes/new';
import DishDetailScreen from './dishes/[id]/view';
import DishEditScreen from './dishes/[id]/edit';
import VisitCreateScreen from './visits/new';
import VisitDetailScreen from './visits/[id]/view';
import VisitEditScreen from './visits/[id]/edit';
import { AuthContext } from '@/lib/context/AuthContext';

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
  function handleLogOut() {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ],
      { cancelable: true }
    );
  }

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
          onPress={async () => handleLogOut()}
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
  const { userToken, loading, logout: contextLogout, isOfflineMode } = useContext(AuthContext);
  router = useRouter();
  logout = contextLogout;

  useEffect(() => {
    if (!loading && (!userToken && !isOfflineMode)) {
      router.replace('/login');
    }
  }, [userToken, loading, router]);

  if (loading || (!userToken && !isOfflineMode)) return null;

  return (
    <SafeAreaView className="flex-1 bg-muted">
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
          component={RestaurantCreateScreen}
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
        <Stack.Screen
          name="dishes/new"
          component={DishCreateScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="dishes/[id]/view"
          component={DishDetailScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="dishes/[id]/edit"
          component={DishEditScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="visits/new"
          component={VisitCreateScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="visits/[id]/view"
          component={VisitDetailScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="visits/[id]/edit"
          component={VisitEditScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </SafeAreaView>
  );
}
