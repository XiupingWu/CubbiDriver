import LocationInput from '@/components/LocationInput';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import React, { useState } from 'react';
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
    const [deliveryLocations, setDeliveryLocations] = useState<Location[]>([]);

    const addDeliveryLocation = (location: Location) => {
        setDeliveryLocations(prev => [...prev, location]);
    };

    const removeDeliveryLocation = (id: string) => {
        setDeliveryLocations(prev => prev.filter(location => location.id !== id));
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
                Delivery Locations
            </Text>

            {/* Location Input Component */}
            <LocationInput type="deliver" onAddLocation={addDeliveryLocation} />

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
