import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export default function DeliverTab() {
    const colorScheme = useColorScheme();
    const router = useRouter();
    const params = useLocalSearchParams();
    const [deliveryLocations, setDeliveryLocations] = useState<Location[]>([]);

    // Handle location added from modal
    useEffect(() => {
        if (params.addedLocation && params.locationType === 'deliver') {
            try {
                const newLocation = JSON.parse(params.addedLocation as string);
                setDeliveryLocations(prev => [...prev, newLocation]);
                // Clear the params to avoid adding the same location multiple times
                router.setParams({ addedLocation: undefined, locationType: undefined });
            } catch (error) {
                console.error('Error parsing location data:', error);
            }
        }
    }, [params.addedLocation, params.locationType]);

    const removeDeliveryLocation = (id: string) => {
        setDeliveryLocations(prev => prev.filter(location => location.id !== id));
    };

    const openAddLocationModal = () => {
        router.push('/modal?type=deliver');
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
        Delivery Locations
            </Text>

            {/* Add Location Button */}
            <TouchableOpacity 
                style={[styles.addButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
                onPress={openAddLocationModal}
            >
                <Text style={styles.addButtonText}>+ Add Delivery Location</Text>
            </TouchableOpacity>

            {/* Locations List */}
            <ScrollView style={styles.locationsList}>
                {deliveryLocations.map((location) => (
                    <View key={location.id} style={[styles.locationCard, { 
                        backgroundColor: Colors[colorScheme ?? 'light'].card,
                        borderColor: Colors[colorScheme ?? 'light'].border 
                    }]}>
                        <View style={styles.locationInfo}>
                            <Text style={[styles.locationName, { color: Colors[colorScheme ?? 'light'].text }]}>
                                {location.name}
                            </Text>
                            <Text style={[styles.locationAddress, { color: Colors[colorScheme ?? 'light'].text }]}>
                                {location.address}
                            </Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.removeButton}
                            onPress={() => removeDeliveryLocation(location.id)}
                        >
                            <Text style={styles.removeButtonText}>×</Text>
                        </TouchableOpacity>
                    </View>
                ))}
        
                {deliveryLocations.length === 0 && (
                    <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].text }]}>
            No delivery locations added yet
                    </Text>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    addButton: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    locationsList: {
        flex: 1,
    },
    locationCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 12,
    },
    locationInfo: {
        flex: 1,
    },
    locationName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    locationAddress: {
        fontSize: 14,
        opacity: 0.7,
    },
    removeButton: {
        padding: 8,
        marginLeft: 12,
    },
    removeButtonText: {
        fontSize: 20,
        color: '#ff3b30',
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        opacity: 0.5,
        marginTop: 40,
    },
});
