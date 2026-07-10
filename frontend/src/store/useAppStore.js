import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // User State
  user: null,
  session: null,
  currentLocation: { lat: 22.307, lng: 73.181 }, // Default fallback
  activeJourneyId: null,
  
  // Emergency State
  isEmergencyActive: false,
  emergencyChecklist: {
    guardianNotified: false,
    audioStarted: false,
    locationShared: false,
    safePlaceFound: false
  },
  
  // Guardian State
  guardianTimeline: [],
  guardianEmergencyState: null, // Holds session data if emergency

  // Smart Alerts State
  activeAlerts: [
    { id: 1, type: 'WEATHER', severity: 'LOW', title: 'Light Rain Expected', message: 'Carry an umbrella just in case.', recommendation: 'Proceed with caution' },
    { id: 2, type: 'CROWD', severity: 'MEDIUM', title: 'Festival Nearby', message: 'Heavy crowds reported near Main St.', recommendation: 'Stay aware of surroundings' }
  ],
  aiSummary: "Your route looks mostly clear, but there are some minor crowds ahead. Stay aware.",

  // Actions
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setCurrentLocation: (loc) => set({ currentLocation: loc }),
  setActiveJourney: (id) => set({ activeJourneyId: id }),
  triggerEmergency: () => set({ isEmergencyActive: true }),
  updateChecklist: (key) => set((state) => ({ 
    emergencyChecklist: { ...state.emergencyChecklist, [key]: true } 
  })),
  resetEmergency: () => set({ 
    isEmergencyActive: false, 
    emergencyChecklist: { 
      guardianNotified: false, 
      audioStarted: false, 
      locationShared: false, 
      safePlaceFound: false 
    } 
  }),

  // New Actions for Guardian & Alerts
  addTimelineEvent: (event) => set((state) => ({
    guardianTimeline: [...state.guardianTimeline, event]
  })),
  setGuardianEmergency: (session) => set({ guardianEmergencyState: session }),
  addAlert: (alert) => set((state) => ({
    activeAlerts: [alert, ...state.activeAlerts]
  })),
  setAiSummary: (summary) => set({ aiSummary: summary })
}));
