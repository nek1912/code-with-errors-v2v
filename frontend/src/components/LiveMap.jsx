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

export default function LiveMap() {
  const currentLocation = useAppStore(state => state.currentLocation);
  const setCurrentLocation = useAppStore(state => state.setCurrentLocation);
  const activeJourneyId = useAppStore(state => state.activeJourneyId);
  const setActiveJourney = useAppStore(state => state.setActiveJourney);

  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState([]);
  const [safePlaces, setSafePlaces] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [journeyTime, setJourneyTime] = useState(0);
  const [journeyDistance, setJourneyDistance] = useState(0);
  const [battery, setBattery] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [lastPosition, setLastPosition] = useState(null);

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
            className="btn-secondary btn-sm"
          >
            <Filter className="w-4 h-4 text-muted" />
            Filters
          </button>
        </div>
      </div>

      {/* Journey Stats Bar */}
      {isTracking && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-dark rounded-xl p-4"
        >
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-title-md font-body font-medium text-on-dark">{formatTime(journeyTime)}</p>
              <p className="text-caption text-on-dark-soft">Duration</p>
            </div>
            <div className="text-center">
              <Navigation className="w-4 h-4 text-accent-teal mx-auto mb-1" />
              <p className="text-title-md font-body font-medium text-on-dark">{journeyDistance.toFixed(1)} km</p>
              <p className="text-caption text-on-dark-soft">Distance</p>
            </div>
            <div className="text-center">
              <Signal className="w-4 h-4 text-accent-amber mx-auto mb-1" />
              <p className="text-title-md font-body font-medium text-on-dark">{speed} km/h</p>
              <p className="text-caption text-on-dark-soft">Speed</p>
            </div>
            <div className="text-center">
              <Battery className="w-4 h-4 text-success mx-auto mb-1" />
              <p className="text-title-md font-body font-medium text-on-dark">{battery || '--'}%</p>
              <p className="text-caption text-on-dark-soft">Battery</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Map Container */}
      <div className="flex-1 rounded-xl overflow-hidden border border-hairline relative">
        <MapContainer
          center={[currentLocation.lat, currentLocation.lng]}
          zoom={15}
          zoomControl={false}
          className="w-full h-full"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <ZoomControl position="bottomright" />
          <MapUpdater center={currentLocation} />

          {currentLocation && (
            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={userIcon} />
          )}

          {destination && (
            <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />
          )}

          {route.length > 0 && (
            <Polyline
              positions={route}
              pathOptions={{ color: '#cc785c', weight: 4, opacity: 0.8, dashArray: '10, 10' }}
            />
          )}

          {filteredPlaces.map((place, i) => (
            <Marker
              key={place.id || i}
              position={[place.lat, place.lng]}
              icon={L.divIcon({
                className: '',
                html: `<div style="
                  font-size: 18px;
                  background: ${place.is247 ? '#5db872' : '#5db8a6'};
                  border-radius: 50%;
                  width: 36px; height: 36px;
                  display: flex; align-items: center; justify-content: center;
                  border: 2px solid white;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                ">${getIconForType(place.type)}</div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 18]
              })}
            >
              <Popup>
                <div className="p-1 min-w-[140px]">
                  <p className="font-bold text-sm m-0">{place.name}</p>
                  <p className="text-xs text-gray-500 m-0 mt-1">{place.type.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-400 m-0 mt-1">{place.distance}m away</p>
                  {place.is247 && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">
                      24/7
                    </span>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 right-4 z-[1000] card-cream p-4 rounded-xl shadow-lg w-52"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-body-sm font-medium text-ink">Filters</h4>
              <button onClick={() => setShowFilters(false)} className="text-muted-soft hover:text-ink">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {Object.keys(filters).map(key => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters[key]}
                    onChange={() => setFilters(f => ({ ...f, [key]: !f[key] }))}
                    className="w-4 h-4 rounded border-hairline text-primary accent-primary"
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

      {/* Journey Controls */}
      <div className="flex gap-3">
        {!isTracking ? (
          <button onClick={startJourney} className="btn-primary flex-1">
            <Play className="w-4 h-4" />
            Start Journey
          </button>
        ) : (
          <button onClick={stopJourney} className="btn-danger flex-1">
            <Square className="w-4 h-4" />
            End Journey
          </button>
        )}
      </div>
    </div>
  );
}
