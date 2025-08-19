import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import ForgotPasswordScreen from '../../app/auth/forgetpassword';
// import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen'; // Import the new screen
import { useAuth } from '../../app/contexts/AuthContext';
// import { RootStackParamList } from '../types'; // Import RootStackParamList
import LoginScreen from '../../app/auth/login';
import MainNavigator from './mainnavigation';
// import { RootStackParamList } from '../types'; // Import RootStackParamList

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          [
            <Stack.Screen key="Login" name="Login" component={LoginScreen} />,
            <Stack.Screen key="ForgotPassword" name="ForgotPassword" component={ForgotPasswordScreen} />
          ]
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RootNavigator;
