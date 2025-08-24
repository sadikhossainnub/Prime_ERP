import { Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00BCD4', // tint color
        tabBarInactiveTintColor: '#808080', // tabIconDefault
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#ffffff', // background color
          borderTopColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb', // This can remain, or be updated if a specific border color is desired for dark theme
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
      <Tabs.Screen
        name="customerform"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="itemform"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="quotationform"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="salesorderform"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="sellingmodulemenu"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="notfound"
        options={{
          title: 'Not Found',
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="404"
        options={{
          title: '404 Not Found',
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
