import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export const requestLocationPermission = async (): Promise<boolean> => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Location Permission Required',
                'This app needs access to your location to optimize routes starting from your current position.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error requesting location permission:', error);
        Alert.alert('Error', 'Failed to request location permission');
        return false;
    }
};

export const getCurrentLocation = async (): Promise<UserLocation | null> => {
    try {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
            return null;
        }

        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeout: 10000,
        });

        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
        };
    } catch (error) {
        console.error('Error getting current location:', error);
        Alert.alert('Error', 'Failed to get your current location. Please try again.');
        return null;
    }
};

export const watchLocation = (
    callback: (location: UserLocation) => void
): (() => void) => {
    let subscription: Location.LocationSubscription | null = null;

    const startWatching = async () => {
        try {
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) return;

            subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.Balanced,
                    distanceInterval: 10, // Update every 10 meters
                    timeInterval: 5000, // Update every 5 seconds
                },
                (location) => {
                    callback({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        accuracy: location.coords.accuracy,
                    });
                }
            );
        } catch (error) {
            console.error('Error watching location:', error);
        }
    };

    startWatching();

    return () => {
        if (subscription) {
            subscription.remove();
        }
    };
};
