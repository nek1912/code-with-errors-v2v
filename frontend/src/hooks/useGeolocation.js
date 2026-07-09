import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export const useGeolocation = () => {
  const setCurrentLocation = useAppStore(state => state.setCurrentLocation);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => console.error("Geolocation error:", error),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [setCurrentLocation]);
};
