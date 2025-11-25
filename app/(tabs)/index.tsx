import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { usePickupLocationsStore } from '@/stores/pickupLocationsStore';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PickupTab() {
    const colorScheme = useColorScheme();
    const router = useRouter();
    const { locations, loading, error, fetchLocations, removeLocation } = usePickupLocationsStore();

    // Fetch locations on component mount
    useEffect(() => {
        fetchLocations();
    }, []);

    const removePickupLocation = (id: string) => {
        removeLocation(id);
    };

    const openAddLocationModal = () => {
        router.push('/modal?type=pickup');
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
        Pick Up Locations
            </Text>

            {/* Add Location Button */}
            <TouchableOpacity 
                style={[styles.addButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
                onPress={openAddLocationModal}
            >
                <Text style={styles.addButtonText}>+ Add Pickup Location</Text>
            </TouchableOpacity>

            {/* Locations List */}
            <ScrollView style={styles.locationsList}>
                {locations.map((location) => (
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
                            onPress={() => removePickupLocation(location.id)}
                        >
                            <Text style={styles.removeButtonText}>×</Text>
                        </TouchableOpacity>
                    </View>
                ))}
        
                {locations.length === 0 && (
                    <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].text }]}>
            No pickup locations added yet
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
