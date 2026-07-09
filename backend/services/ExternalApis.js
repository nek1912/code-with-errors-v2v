const axios = require('axios');

/**
 * RouteService: Fetches polyline points for a route from OpenRouteService.
 * Returns an array of [lat, lng] coordinates for the frontend to draw on Leaflet.
 */
async function getRoutePolyline(startLat, startLng, endLat, endLng) {
  try {
    const apiKey = process.env.OPENROUTE_API_KEY;
    if (!apiKey) {
      console.warn('OPENROUTE_API_KEY missing in .env. Returning mock straight line.');
      return [[startLat, startLng], [endLat, endLng]];
    }

    // OpenRouteService expects coordinates in [lng, lat] order in the query parameters
    const url = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${apiKey}&start=${startLng},${startLat}&end=${endLng},${endLat}`;
    const response = await axios.get(url);
    
    if (response.data && response.data.features && response.data.features.length > 0) {
      // The geometry is a LineString with coordinates as [lng, lat]
      const coords = response.data.features[0].geometry.coordinates;
      // Convert them to [lat, lng] for Leaflet on the frontend
      return coords.map(c => [c[1], c[0]]);
    }
    
    return [];
  } catch (error) {
    console.error('Error in getRoutePolyline:', error.message);
    return [[startLat, startLng], [endLat, endLng]]; // Fallback straight line
  }
}

/**
 * SafePlacesService: Queries Overpass API for nearby safe places.
 * Tags: police, hospital, pharmacy, and 24x7 supermarkets.
 */
async function getNearbySafePlaces(lat, lng, radius = 1000) {
  try {
    const query = `
      [out:json];
      (
        node["amenity"="police"](around:${radius},${lat},${lng});
        way["amenity"="police"](around:${radius},${lat},${lng});
        node["amenity"="hospital"](around:${radius},${lat},${lng});
        way["amenity"="hospital"](around:${radius},${lat},${lng});
        node["amenity"="pharmacy"](around:${radius},${lat},${lng});
        way["amenity"="pharmacy"](around:${radius},${lat},${lng});
        node["shop"="supermarket"]["opening_hours"="24/7"](around:${radius},${lat},${lng});
        way["shop"="supermarket"]["opening_hours"="24/7"](around:${radius},${lat},${lng});
      );
      out center;
    `;
    
    const url = `https://overpass-api.de/api/interpreter`;
    const response = await axios.post(url, `data=${encodeURIComponent(query)}`);
    
    const places = response.data.elements.map(el => {
      // 'out center;' gives lat/lon for ways inside el.center
      const placeLat = el.lat || (el.center && el.center.lat);
      const placeLng = el.lon || (el.center && el.center.lon);
      
      // Calculate a rough pythagorean distance for sorting purposes (in degrees, approx)
      const dLat = placeLat - lat;
      const dLng = placeLng - lng;
      const approxDist = Math.sqrt(dLat * dLat + dLng * dLng);

      return {
        id: el.id,
        name: el.tags.name || 'Unknown',
        type: el.tags.amenity || el.tags.shop || 'safe_place',
        lat: placeLat,
        lng: placeLng,
        distance: approxDist
      };
    });
    
    return places.filter(p => p.lat && p.lng).sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Error in getNearbySafePlaces:', error.message);
    return [];
  }
}

/**
 * GeocodingService: Uses Nominatim to reverse geocode lat/lng to a formatted address string.
 */
async function getAddressFromCoords(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    // Nominatim requires a user-agent to prevent blocking
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'SafeSphereApp/1.0' }
    });
    return response.data.display_name || 'Address not found';
  } catch (error) {
    console.error('Error in getAddressFromCoords:', error.message);
    return 'Address unavailable';
  }
}

/**
 * WeatherService: Fetches current weather from Open-Meteo.
 */
async function getCurrentWeather(lat, lng) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,rain,visibility`;
    const response = await axios.get(url);
    
    if (response.data && response.data.current) {
      return {
        temperature: response.data.current.temperature_2m,
        rain: response.data.current.rain,
        visibility: response.data.current.visibility
      };
    }
    return null;
  } catch (error) {
    console.error('Error in getCurrentWeather:', error.message);
    return null;
  }
}

module.exports = {
  getRoutePolyline,
  getNearbySafePlaces,
  getAddressFromCoords,
  getCurrentWeather
};
