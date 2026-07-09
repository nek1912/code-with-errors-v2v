import React from 'react';
import LiveMap from '../components/LiveMap';
import SmartAlertsSheet from '../components/SmartAlertsSheet';
import { useJourneyTracking } from '../hooks/useJourneyTracking';
import { useAppStore } from '../store/useAppStore';

export default function UserHome() {
  const activeJourneyId = useAppStore(state => state.activeJourneyId);
  useJourneyTracking(activeJourneyId);
  const currentLocation = useAppStore(state => state.currentLocation);

  // Mock safe places around current location
  const safePlaces = [
    { name: 'City Police', type: 'police', lat: currentLocation.lat + 0.005, lng: currentLocation.lng + 0.005 },
    { name: 'General Hospital', type: 'hospital', lat: currentLocation.lat - 0.003, lng: currentLocation.lng - 0.002 },
  ];

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 left-4 z-[1000] bg-gray-900/80 p-3 rounded-xl backdrop-blur-sm border border-gray-700 shadow-xl">
        <h2 className="text-xl font-bold text-white">Live Journey Tracker</h2>
        <p className="text-sm text-gray-400">Monitoring your location...</p>
      </div>
      
      <div className="absolute inset-0 z-0">
        <LiveMap 
          userLocation={currentLocation} 
          safePlaces={safePlaces}
          isGuardianView={false} 
        />
      </div>

      <SmartAlertsSheet />
    </div>
  );
}
