import { getCurrentLocation } from './locationService';
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
        throw new Error('Please select at least 2 locations to optimize route');
    }

    try {
        // Get user's current location for starting point
        const userLocation = await getCurrentLocation();
        
        if (!userLocation) {
            throw new Error('Unable to get your current location. Please enable location services and try again.');
        }

        const { data, error } = await supabase.functions.invoke('route-optimizer', {
            body: {
                table,
                ids: selectedLocations,
                currentLocation: {
                    lat: userLocation.latitude,
                    lng: userLocation.longitude,
                },
            },
        });

        if (error) {
            throw new Error(error.message || 'Failed to optimize route');
        }

        if (!data?.mapsUrl) {
            throw new Error('No route optimization data returned');
        }

        return data;
    } catch (error) {
        console.error('Route optimization error:', error);
        throw error;
    }
};
