import { MobileLocation } from '@/types/doctypes';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { apiRequest } from './api';
import { getCurrentUserInfo } from './profile';

const LOCATION_TRACKING_TASK = 'background-location-task';

TaskManager.defineTask(LOCATION_TRACKING_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Location tracking task error:', error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const userInfo = await getCurrentUserInfo();
    const userEmail = userInfo.email;

    if (!userEmail) {
      console.error('User email not found. Cannot post location.');
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
        await apiRequest('Mobile Location', {
          method: 'POST',
          body: JSON.stringify(mobileLocation),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('Location posted:', mobileLocation);
      } catch (apiError) {
        console.error('Failed to post location:', apiError);
      }
    }
  }
});

export const startLocationTracking = async (): Promise<boolean> => {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus === 'granted') {
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus === 'granted') {
      await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 5 * 60 * 1000, // 5 minutes in milliseconds
        distanceInterval: 10, // Update every 10 meters
        foregroundService: {
          notificationTitle: 'Location Tracking',
          notificationBody: 'Tracking your location in the background',
          notificationColor: '#4f46e5',
        },
      });
      console.log('Background location tracking started.');
      return true;
    } else {
      console.warn('Background location permission not granted.');
      alert('Background location permission is required for full functionality.');
    }
  } else {
    console.warn('Foreground location permission not granted.');
    alert('Foreground location permission is required to track location.');
  }
  return false;
};

export const stopLocationTracking = async () => {
  if (await TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING_TASK)) {
    await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
    console.log('Background location tracking stopped.');
  }
};