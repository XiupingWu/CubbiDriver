import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

interface Location {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
}

export default function ModalScreen() {
    const colorScheme = useColorScheme();
    const router = useRouter();
    const params = useLocalSearchParams();
    const type = params.type as 'pickup' | 'deliver';

    const [selectedPlace, setSelectedPlace] = useState<any>(null);

    const handleAddLocation = () => {
        if (!selectedPlace) {
            Alert.alert('Error', 'Please select a location first');
            return;
        }

        const newLocation: Location = {
            id: Date.now().toString(),
            name: selectedPlace.name,
            address: selectedPlace.formatted_address,
            latitude: selectedPlace.geometry.location.lat,
            longitude: selectedPlace.geometry.location.lng,
        };

        // Pass the new location back to the parent screen
        router.setParams({ 
            addedLocation: JSON.stringify(newLocation),
            locationType: type 
        });
        router.back();
    };
    
    const placeholder = type === 'pickup' 
        ? 'Search for pickup location...' 
        : 'Search for delivery location...';

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
                Add {type === 'pickup' ? 'Pick Up' : 'Delivery'} Location
            </Text>
            <View style={styles.inputContainer}>
                <GooglePlacesAutocomplete
                    placeholder={placeholder}
                    onPress={(data, details = null) => {
                        setSelectedPlace(details);
                    }}
                    query={{
                        key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
                        language: 'en',
                        components: 'country:ca',
                    }}
                    debounce={200}
                    styles={{
                        textInput: {
                            height: 44,
                            color: Colors[colorScheme ?? 'light'].text,
                            fontSize: 16,
                            borderWidth: 1,
                            borderColor: Colors[colorScheme ?? 'light'].border,
                            borderRadius: 8,
                            paddingHorizontal: 12,
                        },
                        predefinedPlacesDescription: {
                            color: '#1faadb',
                        },
                    }}
                    fetchDetails={true}
                    enablePoweredByContainer={false}
                />
            </View>
            
            <View>
                <TouchableOpacity 
                    style={[styles.addButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
                    onPress={handleAddLocation}
                >
                    <Text style={styles.addButtonText}>Add Location</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => router.back()}
                >
                    <Text style={[styles.cancelButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                        Cancel
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 30,
    },
    addButton: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
