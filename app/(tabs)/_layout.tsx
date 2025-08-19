import { Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4f46e5', // primary-500
        tabBarInactiveTintColor: '#6b7280', // gray-500
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff', // gray-800 or white
          borderTopColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb', // gray-700 or gray-200
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused, color, size }) => (
            <Icon
              name={focused ? 'view-dashboard' : 'view-dashboard-outline'}
              size={size + 4}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Module"
        options={{
          title: 'Module',
          tabBarIcon: ({ color, size }) => (
            <Icon name="information-outline" size={size + 4} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color, size }) => (
            <Icon
              name={focused ? 'account' : 'account-outline'}
              size={size + 4}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="sellingmodulemenu"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="quotationlist"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="customerlist"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="orderlist"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="itemlist"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
