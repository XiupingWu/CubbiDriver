import { Alert, Linking } from 'react-native';
import { supabase } from './supabaseClient';

export interface RouteOptimizationResult {
  orderedIds: string[];
  orderedLocations: any[];
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  mapsUrl: string;
  directions?: any;
}

export const optimizeRoute = async (
    table: 'pickup_locations' | 'deliver_locations', 
    selectedLocations: string[]
): Promise<RouteOptimizationResult | null> => {
    if (selectedLocations.length < 2) {
        Alert.alert('Error', 'Please select at least 2 locations to optimize route');
        return null;
    }

    try {
        const { data, error } = await supabase.functions.invoke('route-optimizer', {
            body: {
                table,
                ids: selectedLocations,
            },
        });

        if (error) {
            throw new Error(error.message || 'Failed to optimize route');
        }

        if (data?.mapsUrl) {
            const canOpen = await Linking.canOpenURL(data.mapsUrl);
            if (canOpen) {
                await Linking.openURL(data.mapsUrl);
            } else {
                Alert.alert('Error', 'Cannot open Google Maps');
            }
        } else {
            Alert.alert('Error', 'No route optimization data returned');
        }

        return data;
    } catch (error) {
        console.error('Route optimization error:', error);
        Alert.alert('Error', 'Failed to optimize route');
        return null;
    }
};
