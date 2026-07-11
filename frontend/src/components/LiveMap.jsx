import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, ZoomControl, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import {
  Navigation, MapPin, Shield, Clock, Battery, Signal, Play, Square,
  RotateCcw, Filter, X, ChevronDown, AlertTriangle, Users
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import api from '../services/api';

// Custom icons
const userIcon = new L.DivIcon({
  html: `<div style="
    width: 20px; height: 20px;
    background: #cc785c;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 0 20px rgba(204, 120, 92, 0.5);
    animation: pulse 2s infinite;
  "></div>
  <style>
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(204, 120, 92, 0.7); }
      70% { box-shadow: 0 0 0 15px rgba(204, 120, 92, 0); }
      100% { box-shadow: 0 0 0 0 rgba(204, 120, 92, 0); }
    }
  </style>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const destinationIcon = new L.DivIcon({
  html: `<div style="
    width: 24px; height: 24px;
    background: #c64545;
    border: 3px solid white;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  "></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

const getIconForType = (type) => {
  const icons = {
    police: '🚓', hospital: '🏥', clinic: '🏥', pharmacy: '💊',
    fire_station: '🚒', petrol_pump: '⛽', convenience_store: '🏪',
    '24x7_store': '🏪', restaurant: '🍽️', cafe: '☕', mall: '🛍️',
    bank: '🏦', atm: '🏧', metro_station: '🚇', bus_station: '🚌', hotel: '🏨'
  };
  return icons[type] || '📍';
};

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
};

export default function LiveMap({ userLocation, destinationLocation, polyline, isGuardianView }) {
  const defaultCenter = userLocation || { lat: 22.307, lng: 73.181 };
  const [apiSafePlaces, setApiSafePlaces] = useState([]);
  
  // Filter UI State
  const [filters, setFilters] = useState({
    police: true, hospital: true, pharmacy: true,
    petrol_pump: true, metro_station: true
  });

  const watchIdRef = useRef(null);
  const timerRef = useRef(null);
  const positionsRef = useRef([]);

  // Get user's live location
  useEffect(() => {
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCurrentLocation(loc);
          setSpeed(pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0);

          if (isTracking) {
            positionsRef.current.push(loc);
            if (positionsRef.current.length > 1) {
              const prev = positionsRef.current[positionsRef.current.length - 2];
              const dist = calculateDistance(prev.lat, prev.lng, loc.lat, loc.lng);
              setJourneyDistance(d => d + dist);
            }
          }

          setLastPosition(loc);
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    }
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [isTracking]);

  // Journey timer
  useEffect(() => {
    if (isTracking) {
      timerRef.current = setInterval(() => setJourneyTime(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTracking]);

  // Battery status
  useEffect(() => {
    if (navigator.getBattery) {
      navigator.getBattery().then(b => {
        setBattery(Math.round(b.level * 100));
        b.addEventListener('levelchange', () => setBattery(Math.round(b.level * 100)));
      });
    }
  }, []);

  // Fetch safe places
  useEffect(() => {
    const fetchPlaces = async () => {
      if (!currentLocation) return;
      try {
        const { data } = await api.get('/api/guardian/safe-places', {
          params: { lat: currentLocation.lat, lng: currentLocation.lng, radius: 5000 }
        });
        setSafePlaces(data);
      } catch {}
    };
    fetchPlaces();
  }, [currentLocation]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const startJourney = async () => {
    setIsTracking(true);
    setJourneyTime(0);
    setJourneyDistance(0);
    positionsRef.current = [currentLocation];
    try {
      const { data } = await api.post('/api/journey/start', {
        startLocation: currentLocation,
      });
      setActiveJourney(data.journeyId);
    } catch {}
  };

  const stopJourney = async () => {
    setIsTracking(false);
    if (activeJourneyId) {
      try {
        await api.post(`/api/journey/${activeJourneyId}/end`, {
          endLocation: currentLocation,
          duration: journeyTime,
          distance: journeyDistance,
        });
      } catch {}
      setActiveJourney(null);
    }
    positionsRef.current = [];
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredPlaces = safePlaces.filter(place => filters[place.type] !== false);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-display-sm text-ink" style={{ letterSpacing: '-0.02em' }}>
            Live Map
          </h1>
          <p className="text-body-sm text-muted">
            {isTracking ? 'Journey in progress' : 'Track your journey in real-time'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-900/90 backdrop-blur text-white px-4 py-2 rounded-xl border border-gray-700 shadow-xl font-bold flex items-center space-x-2 transition-transform hover:scale-105"
          >
            <Filter className="w-4 h-4 text-muted" />
            Filters
          </button>
          
          {showFilters && (
            <div className="mt-2 bg-gray-900/95 backdrop-blur-md border border-gray-700 p-4 rounded-xl shadow-2xl w-56 flex flex-col space-y-2">
              <h4 className="text-white text-sm font-bold mb-2">Show on Map</h4>
              {Object.keys(filters).map(key => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters[key]}
                    onChange={() => toggleFilter(key)}
                    className="form-checkbox h-4 w-4 text-blue-500 rounded bg-gray-800 border-gray-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-body-sm text-muted capitalize">{key.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </motion.div>
        )}

        {/* Location indicator */}
        <div className="absolute bottom-4 left-4 z-[1000]">
          <div className="card-cream px-3 py-2 rounded-lg shadow-md flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-caption text-muted">
              {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
            </span>
          </div>
        </div>
      </div>

        {/* Route Polyline */}
        {polyline && polyline.length > 0 && (
          <Polyline positions={polyline} color="#10b981" weight={4} opacity={0.8} />
        )}
      </div>
    </div>
  );
}
