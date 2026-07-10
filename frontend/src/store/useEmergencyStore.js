import { create } from 'zustand';

export const useEmergencyStore = create((set, get) => ({
  isEmergencyMode: false,
  emergencyAlerts: [],
  isLoading: false,
  location: null,

  startEmergency: () => {
    set({ isEmergencyMode: true });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => set({ location: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
        () => set({ location: null })
      );
    }
  },

  stopEmergency: () => {
    set({ isEmergencyMode: false, emergencyAlerts: [] });
  },

  sendEmergencyMessage: (message) => {
    set((state) => ({
      emergencyAlerts: [
        ...state.emergencyAlerts,
        { message, timestamp: new Date().toISOString() },
      ],
    }));
  },
}));
