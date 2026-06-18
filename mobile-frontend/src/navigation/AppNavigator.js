import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ListingFormScreen from '../screens/ListingFormScreen';
import ListingDetailScreen from '../screens/ListingDetailScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }) {
  const icons = { İlanlar: '🚗', Favoriler: '❤️', Giriş: '🔑', Profil: '👤' };
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>{icons[label]}</Text>;
}

function MainTabs() {
  const { isLoggedIn } = useAuth();

  return (
    <Tab.Navigator
      key={isLoggedIn ? 'logged-in' : 'guest'}
      screenOptions={{
        headerStyle: { backgroundColor: colors.secondary },
        headerTintColor: '#fff',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: '32Bit Garage',
          tabBarLabel: 'İlanlar',
          tabBarIcon: ({ focused }) => <TabIcon label="İlanlar" focused={focused} />
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: 'Favoriler',
          tabBarLabel: 'Favoriler',
          tabBarIcon: ({ focused }) => <TabIcon label="Favoriler" focused={focused} />
        }}
      />
      {isLoggedIn ? (
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'Profilim',
            tabBarLabel: 'Profil',
            tabBarIcon: ({ focused }) => <TabIcon label="Profil" focused={focused} />
          }}
        />
      ) : (
        <Tab.Screen
          name="Auth"
          component={AuthScreen}
          options={{
            title: 'Giriş / Üye Ol',
            tabBarLabel: 'Giriş',
            tabBarIcon: ({ focused }) => <TabIcon label="Giriş" focused={focused} />
          }}
        />
      )}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.secondary }, headerTintColor: '#fff' }}>
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="ListingForm" component={ListingFormScreen} options={{ title: 'İlan Formu' }} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: 'İlan Detayı' }} />
    </Stack.Navigator>
  );
}
