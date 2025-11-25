import { create } from 'zustand';

interface UserSettings {
  defaultPickupLocation: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  defaultDeliverLocation: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
}

interface UserSettingsStore extends UserSettings {
  setDefaultPickupLocation: (location: UserSettings['defaultPickupLocation']) => void;
  setDefaultDeliverLocation: (location: UserSettings['defaultDeliverLocation']) => void;
}

export const useUserSettingsStore = create<UserSettingsStore>((set) => ({
    // Hardcoded default locations for now
    defaultPickupLocation: {
        name: 'Default Pickup Location',
        address: '123 Main St, Edmonton, AB',
        latitude: 53.5461,
        longitude: -113.4938
    },
    defaultDeliverLocation: {
        name: 'Default Delivery Location',
        address: '456 Jasper Ave, Edmonton, AB',
        latitude: 53.5436,
        longitude: -113.4907
    },
  
    setDefaultPickupLocation: (location) => 
        set({ defaultPickupLocation: location }),
  
    setDefaultDeliverLocation: (location) => 
        set({ defaultDeliverLocation: location }),
}));
