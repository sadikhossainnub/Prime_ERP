import { MobileLocation } from '@/types/doctypes';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { apiRequest } from './api';

const LOCATION_TRACKING_TASK = 'background-location-task';

// Helper function to get saved credentials
const getLocationTrackingCredentials = async () => {
  try {
    const credentials = await AsyncStorage.getItem('LOCATION_TRACKING_CREDENTIALS');
    if (credentials) {
      return JSON.parse(credentials);
    }
    return null;
  } catch (error) {
    console.error('Failed to retrieve location tracking credentials:', error);
    return null;
  }
};

if (Platform.OS !== 'web') {
  TaskManager.defineTask(LOCATION_TRACKING_TASK, async ({ data, error }) => {
    if (error) {
      console.error('Location tracking task error:', error);
      return;
    }
    if (data) {
      const { locations } = data as { locations: Location.LocationObject[] };
      // const userInfo = await getCurrentUserInfo(); // Removed to use saved credentials
      // const userEmail = userInfo.email;

      const credentials = await getLocationTrackingCredentials();
      const userEmail = credentials?.email; // Use email from saved credentials

      if (!userEmail) {
        console.error('User email not found from saved credentials. Cannot post location.');
        return;
      }

      for (const location of locations) {
        const mobileLocation: MobileLocation = {
          user: userEmail,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: new Date(location.timestamp).toISOString().replace('T', ' ').substring(0, 19),
        };
        try {
          // Assuming your backend has a method to receive location data
          // You might need to adjust the endpoint and payload structure
          // If the API requires authentication, you might need to pass credentials here
          // For now, assuming apiRequest handles authentication via SID or similar
          await apiRequest('Mobile Location', {
            method: 'POST',
            data: mobileLocation,
          });
          console.log('Location posted:', mobileLocation);
        } catch (apiError) {
          console.error('Failed to post location:', apiError);
        }
      }
    }
  });
}

export const startLocationTracking = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    console.log('Location tracking is not supported on web.');
    return false;
  }

  // Check if credentials are saved before requesting permissions
  const credentials = await getLocationTrackingCredentials();
  if (!credentials) {
    console.warn('No location tracking credentials found. Please log in first.');
    // alert('Please log in to enable location tracking.');
    return false;
  }

  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus === 'granted') {
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus === 'granted') {
      await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 60 * 1000, // 1 minute in milliseconds
        distanceInterval: 10, // Update every 10 meters
      });
      console.log('Background location tracking started.');
      return true;
    } else {
      console.warn('Background location permission not granted.');
      // alert('Background location permission is required for full functionality.');
    }
  } else {
    console.warn('Foreground location permission not granted.');
    // alert('Foreground location permission is required to track location.');
  }
  return false;
};

export const stopLocationTracking = async () => {
  if (Platform.OS === 'web') {
    console.log('Location tracking is not supported on web.');
    return;
  }
  if (await TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING_TASK)) {
    await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
    console.log('Background location tracking stopped.');
  }
};
