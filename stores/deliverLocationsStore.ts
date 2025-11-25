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

interface DeliverLocationsStore {
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

export const useDeliverLocationsStore = create<DeliverLocationsStore>((set, get) => ({
    locations: [],
    loading: false,
    error: null,

    fetchLocations: async () => {
        set({ loading: true, error: null });
        try {
            const { data, error } = await supabase
                .from('deliver_locations')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log('Fetched deliver locations data:', data);
            set({ locations: data || [] });
        } catch (error) {
            console.error('Error fetching deliver locations:', error);
            set({ error: error instanceof Error ? error.message : 'Failed to fetch deliver locations' });
        } finally {
            set({ loading: false });
        }
    },

    addLocation: async (location) => {
        set({ loading: true, error: null });
        try {
            console.log('hit here')
            const { data, error } = await supabase.functions.invoke('add-location', {
                body: JSON.stringify({...location, table: 'deliver_locations'}),
            })

            if(error) {
                throw error;
            }

            console.log(data);
            get().fetchLocations();

        } catch (error) {
            console.error('Error adding deliver location:', error);
            set({ 
                error: error instanceof Error ? error.message : 'Failed to add deliver location',
                loading: false 
            });
        }
    },

    removeLocation: async (id: string) => {
        set({ loading: true, error: null });
        try {
            const { error } = await supabase
                .from('deliver_locations')
                .delete()
                .eq('id', id);

            if (error) throw error;

            set((state) => ({
                locations: state.locations.filter(location => location.id !== id),
                loading: false
            }));
        } catch (error) {
            console.error('Error removing deliver location:', error);
            set({ 
                error: error instanceof Error ? error.message : 'Failed to remove deliver location',
                loading: false 
            });
        }
    },

    updateLocation: async (id: string, updates: Partial<Location>) => {
        set({ loading: true, error: null });
        try {
            const { data, error } = await supabase
                .from('deliver_locations')
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
            console.error('Error updating deliver location:', error);
            set({ 
                error: error instanceof Error ? error.message : 'Failed to update deliver location',
                loading: false 
            });
        }
    },

    clearError: () => set({ error: null }),
}));
