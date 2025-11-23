import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

interface LocationInputProps {
  type: 'pickup' | 'deliver';
  onAddLocation: (location: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  }) => void;
}

export default function LocationInput({ type, onAddLocation }: LocationInputProps) {
    const colorScheme = useColorScheme();
    const [selectedPlace, setSelectedPlace] = useState<any>(null);

    const handleAddLocation = () => {
        if (!selectedPlace) {
            Alert.alert('Error', 'Please select a location first');
            return;
        }

        const newLocation = {
            id: Date.now().toString(),
            name: selectedPlace.name,
            address: selectedPlace.formatted_address,
            latitude: selectedPlace.geometry.location.lat,
            longitude: selectedPlace.geometry.location.lng,
        };

        onAddLocation(newLocation);
        setSelectedPlace(null);
    };

    const placeholder = type === 'pickup' 
        ? 'Search for pickup location...' 
        : 'Search for delivery location...';

    return (
        <View style={styles.autocompleteContainer}>
            <GooglePlacesAutocomplete
                placeholder={placeholder}
                onPress={(data, details = null) => {
                    setSelectedPlace(details);
                }}
                query={{
                    key: 'YOUR_GOOGLE_PLACES_API_KEY', // You'll need to add your API key
                    language: 'en',
                }}
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

            <TouchableOpacity 
                style={[styles.addButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
                onPress={handleAddLocation}
            >
                <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    autocompleteContainer: {
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center'
    },
    addButton: {
        marginTop: 10,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
