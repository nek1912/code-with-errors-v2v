import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import LiveMap from '../components/LiveMap';
import SmartAlertsSheet from '../components/SmartAlertsSheet';
import { useJourneyTracking } from '../hooks/useJourneyTracking';
import { useSupabaseRealtime } from '../hooks/useSupabaseRealtime';
import { useAppStore } from '../store/useAppStore';

export default function UserHome() {
  const { activeJourneyId, setActiveJourney, guardianTimeline, addTimelineEvent, currentLocation } = useAppStore();
  
  // Track location in background
  useJourneyTracking(activeJourneyId);

  // Realtime listener for events (Timeline parity)
  useSupabaseRealtime('journey_events', (newEvent) => {
    addTimelineEvent({
      id: newEvent.id,
      title: newEvent.title || newEvent.event_type,
      time: new Date(newEvent.created_at || Date.now()).toLocaleTimeString()
    });
  }, 'journey_id', activeJourneyId);

  // Route Polyline State
  const [routePolyline, setRoutePolyline] = useState([]);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  // Summary Modal State
  const [journeySummary, setJourneySummary] = useState(null);
  const [isEnding, setIsEnding] = useState(false);

  const handleEndJourney = async () => {
    if (!activeJourneyId) return;
    setIsEnding(true);
    try {
      const response = await axios.post('http://localhost:3000/api/journey/end', { journeyId: activeJourneyId });
      setJourneySummary(response.data);
    } catch (error) {
      console.error('Error ending journey:', error);
    } finally {
      setIsEnding(false);
    }
  };

  const closeSummary = () => {
    setJourneySummary(null);
    setActiveJourney(null);
    setRoutePolyline([]);
    setDestinationLocation(null);
  };

  const fetchRoute = async (startLat, startLng, destLat, destLng) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post('http://localhost:3000/api/route/directions', {
        startLat, startLng, endLat: destLat, endLng: destLng, profile: 'foot-walking'
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      if (data.success) {
        setRoutePolyline(data.route.polyline);
        console.log(`Route distance: ${data.route.distance}m, Duration: ${data.route.duration}s`);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  const handleStartJourney = async () => {
    if (!currentLocation) return alert('Waiting for location...');
    setIsStarting(true);
    try {
      const destLat = currentLocation.lat + 0.02;
      const destLng = currentLocation.lng + 0.02;
      
      const token = localStorage.getItem('token');
      let userId = useAppStore.getState().user?.id;
      if (!userId && token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userId = payload.id || payload.userId;
        } catch (e) {
          console.error('Failed to parse token payload');
        }
      }

      const { data } = await axios.post('http://localhost:3000/api/journey/start', {
        userId: userId || '550e8400-e29b-41d4-a716-446655440000',
        destinationName: 'Safe House',
        destinationLat: destLat,
        destinationLng: destLng,
        transportMode: 'foot-walking'
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (data.success) {
        setActiveJourney(data.journey.id);
        setDestinationLocation({ lat: destLat, lng: destLng });
        await fetchRoute(currentLocation.lat, currentLocation.lng, destLat, destLng);
      }
    } catch (error) {
      console.error('Error starting journey:', error);
      alert(`Failed to start journey: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsStarting(false);
    }
  };

  // Mock safe places around current location
  const safePlaces = [
    { name: 'City Police', type: 'police', lat: currentLocation.lat + 0.005, lng: currentLocation.lng + 0.005 },
    { name: 'General Hospital', type: 'hospital', lat: currentLocation.lat - 0.003, lng: currentLocation.lng - 0.002 },
  ];

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Top Header & Controls */}
      <div className="absolute top-4 left-4 z-[1000] bg-navy-900/90 p-4 rounded-xl backdrop-blur-md border border-navy-700 shadow-2xl flex items-center justify-between w-[calc(100%-2rem)] md:w-auto md:min-w-[350px]">
        <div>
          <h2 className="text-xl font-bold text-white">Live Journey Tracker</h2>
          <p className="text-sm text-navy-600">Active ID: {activeJourneyId || 'None'}</p>
        </div>
        {activeJourneyId ? (
          <button 
            onClick={handleEndJourney}
            disabled={isEnding}
            className="ml-4 px-4 py-2 bg-red-500/80 hover:bg-red-400 rounded-lg text-white text-sm font-bold shadow-lg transition-colors border border-red-400/30"
          >
            {isEnding ? 'ENDING...' : 'END JOURNEY'}
          </button>
        ) : (
          <button 
            onClick={handleStartJourney}
            disabled={isStarting}
            className="ml-4 px-4 py-2 bg-gold-500/80 hover:bg-gold-400 rounded-lg text-navy-900 text-sm font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-colors border border-gold-400/50"
          >
            {isStarting ? 'STARTING...' : 'START JOURNEY'}
          </button>
        )}
      </div>

      {/* Live Timeline Overlay */}
      {activeJourneyId && (
        <div className="absolute bottom-24 left-4 z-[1000] bg-navy-900/90 backdrop-blur-md p-4 rounded-xl border border-navy-700 shadow-2xl w-80 max-h-64 flex flex-col hidden md:flex">
          <h3 className="text-sm font-semibold text-navy-600 uppercase tracking-wider mb-4">Event Timeline</h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {guardianTimeline.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No events recorded yet...</p>
            ) : (
              guardianTimeline.map((evt, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]"></div>
                  <div>
                    <p className="text-sm text-gray-200 font-medium">{evt.title}</p>
                    <p className="text-xs text-gray-500">{evt.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <LiveMap 
          userLocation={currentLocation}
          destinationLocation={destinationLocation}
          routePolyline={routePolyline}
          safePlaces={safePlaces}
          isGuardianView={false} 
        />
      </div>

      <SmartAlertsSheet />

      {/* Journey Summary Modal */}
      <AnimatePresence>
        {journeySummary && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-navy-800 border border-navy-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                  <span className="text-3xl">🏁</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Journey Complete</h2>
                <p className="text-blue-100 mt-1">You have arrived safely.</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-navy-900/50 p-4 rounded-xl border border-navy-700/50 text-center">
                    <p className="text-xs text-navy-600 uppercase tracking-widest mb-1">Duration</p>
                    <p className="text-2xl font-bold text-white">{journeySummary.durationMinutes} <span className="text-sm font-normal text-navy-600">min</span></p>
                  </div>
                  <div className="bg-navy-900/50 p-4 rounded-xl border border-navy-700/50 text-center">
                    <p className="text-xs text-navy-600 uppercase tracking-widest mb-1">Distance</p>
                    <p className="text-2xl font-bold text-white">{journeySummary.distanceMovedKm} <span className="text-sm font-normal text-navy-600">km</span></p>
                  </div>
                </div>

                <div className="bg-navy-900/30 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-navy-600">Total Events Logged</span>
                    <span className="text-white font-bold bg-royal-500/30 px-2 py-0.5 rounded text-indigo-400">{journeySummary.eventCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-3 border-t border-navy-700/50 pt-3">
                    <span className="text-navy-600">Final Status</span>
                    <span className="text-green-400 font-bold uppercase tracking-wider text-xs">COMPLETED</span>
                  </div>
                </div>

                <button 
                  onClick={closeSummary}
                  className="w-full py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition-colors shadow-lg"
                >
                  Close Summary
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
