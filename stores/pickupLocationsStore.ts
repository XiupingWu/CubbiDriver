import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

export interface Location {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    created_at?: string;
    updated_at?: string;
}

interface PickupLocationsStore {
    locations: Location[];
    loading: boolean;
    error: string | null;
    
    // Actions
    fetchLocations: () => Promise<void>;
    addLocation: (location: Omit<Location, 'id'>) => Promise<void>;
    removeLocation: (id: string) => Promise<void>;
    updateLocation: (id: string, updates: Partial<Location>) => Promise<void>;
    clearError: () => void;
}

export const usePickupLocationsStore = create<PickupLocationsStore>((set, get) => ({
    locations: [],
    loading: false,
    error: null,

    fetchLocations: async () => {
        set({ loading: true, error: null });
        try {
            const { data, error } = await supabase
                .from('pickup_locations')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            set({ locations: data || [] });
        } catch (error) {
            throw error;
        } finally {
            set({ loading: false});
        }
    },

    addLocation: async (location) => {
        set({ loading: true, error: null });
        try {
            const { error } = await supabase.functions.invoke('add-location', {
                body: JSON.stringify({...location, table: 'pickup_locations'}),
            })

            if(error) {
                throw error;
            }

            get().fetchLocations();

        } catch (error) {
            console.error('Error adding pickup location:', error);
            set({ 
                error: error instanceof Error ? error.message : 'Failed to add pickup location',
                loading: false 
            });
        }
    },

    removeLocation: async (id: string) => {
        set({ loading: true, error: null });
        try {
            const { error } = await supabase
                .from('pickup_locations')
                .delete()
                .eq('id', id);

            if (error) throw error;

            set((state) => ({
                locations: state.locations.filter(location => location.id !== id),
                loading: false
            }));
        } catch (error) {
            console.error('Error removing pickup location:', error);
            set({ 
                error: error instanceof Error ? error.message : 'Failed to remove pickup location',
                loading: false 
            });
        }
    },

    updateLocation: async (id: string, updates: Partial<Location>) => {
        set({ loading: true, error: null });
        try {
            const { data, error } = await supabase
                .from('pickup_locations')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            if (data) {
                set((state) => ({
                    locations: state.locations.map(location => 
                        location.id === id ? { ...location, ...data } : location
                    ),
                    loading: false
                }));
            }
        } catch (error) {
            console.error('Error updating pickup location:', error);
            set({ 
                error: error instanceof Error ? error.message : 'Failed to update pickup location',
                loading: false 
            });
        }
    },

    clearError: () => set({ error: null }),
}));
