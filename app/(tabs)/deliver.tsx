import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { optimizeRoute } from '@/lib/routeOptimizer';
import { useDeliverLocationsStore } from '@/stores/deliverLocationsStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DeliverTab() {
    const colorScheme = useColorScheme();
    const router = useRouter();
    const { locations, loading, error, fetchLocations, removeLocation } = useDeliverLocationsStore();
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

    // Fetch locations on component mount
    useEffect(() => {
        fetchLocations();
    }, []);

    const toggleLocationSelection = (id: string) => {
        setSelectedLocations(prev => 
            prev.includes(id) 
                ? prev.filter(locationId => locationId !== id)
                : [...prev, id]
        );
    };

    const removeDeliveryLocation = (id: string) => {
        removeLocation(id);
        setSelectedLocations(prev => prev.filter(locationId => locationId !== id));
    };

    const openAddLocationModal = () => {
        router.push('/modal?type=deliver');
    };

    const handleOptimizeRoute = async () => {
        await optimizeRoute('deliver_locations', selectedLocations);
    };

    const clearSelection = () => {
        setSelectedLocations([]);
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
        Delivery Locations
            </Text>

            {/* Action Buttons */}
            {selectedLocations.length > 0 && (
                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity 
                        style={[styles.optimizeButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
                        onPress={handleOptimizeRoute}
                    >
                        <Text style={styles.optimizeButtonText}>
                            Optimize Route ({selectedLocations.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.clearButton}
                        onPress={clearSelection}
                    >
                        <Text style={[styles.clearButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                            Clear
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Add Location Button */}
            <TouchableOpacity 
                style={[styles.addButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
                onPress={openAddLocationModal}
            >
                <Text style={styles.addButtonText}>+ Add Delivery Location</Text>
            </TouchableOpacity>

            {/* Locations List */}
            <ScrollView style={styles.locationsList}>
                {locations.map((location) => {
                    const isSelected = selectedLocations.includes(location.id);
                    return (
                        <TouchableOpacity 
                            key={location.id} 
                            style={[
                                styles.locationCard, 
                                { 
                                    backgroundColor: isSelected 
                                        ? Colors[colorScheme ?? 'light'].tint + '20' 
                                        : Colors[colorScheme ?? 'light'].card,
                                    borderColor: isSelected 
                                        ? Colors[colorScheme ?? 'light'].tint 
                                        : Colors[colorScheme ?? 'light'].border 
                                }
                            ]}
                            onPress={() => toggleLocationSelection(location.id)}
                        >
                            <View style={styles.locationInfo}>
                                <Text style={[styles.locationName, { 
                                    color: isSelected 
                                        ? Colors[colorScheme ?? 'light'].tint 
                                        : Colors[colorScheme ?? 'light'].text 
                                }]}>
                                    {location.name}
                                </Text>
                                <Text style={[styles.locationAddress, { 
                                    color: isSelected 
                                        ? Colors[colorScheme ?? 'light'].tint + 'CC' 
                                        : Colors[colorScheme ?? 'light'].text 
                                }]}>
                                    {location.address}
                                </Text>
                            </View>
                            <View style={styles.locationActions}>
                                {isSelected && (
                                    <View style={styles.selectedIndicator}>
                                        <Text style={styles.selectedIndicatorText}>✓</Text>
                                    </View>
                                )}
                                <TouchableOpacity 
                                    style={styles.removeButton}
                                    onPress={() => removeDeliveryLocation(location.id)}
                                >
                                    <Text style={styles.removeButtonText}>×</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    );
                })}
        
                {locations.length === 0 && (
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
    actionButtonsContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 12,
    },
    optimizeButton: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    optimizeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    clearButton: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    clearButtonText: {
        fontSize: 16,
        fontWeight: '600',
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
    locationActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectedIndicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    selectedIndicatorText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
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
