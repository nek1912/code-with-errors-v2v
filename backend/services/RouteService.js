const axios = require('axios');

class RouteService {
  static async getDirections(startLat, startLng, endLat, endLng, profile = 'foot-walking') {
    try {
      if (!process.env.OPENROUTE_API_KEY) {
        throw new Error('OpenRouteService API key is missing');
      }

      const url = `https://api.openrouteservice.org/v2/directions/${profile}/geojson`;
      
      const response = await axios.post(url, {
        coordinates: [
          [startLng, startLat],
          [endLng, endLat]
        ]
      }, {
        headers: {
          'Authorization': process.env.OPENROUTE_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json, application/geo+json, application/vnd.geo+json'
        }
      });

      // Extract the polyline coordinates from the GeoJSON response
      const routeData = response.data.features[0];
      const coordinates = routeData.geometry.coordinates;
      const summary = routeData.properties.summary; // distance (m), duration (s)

      // Convert [lng, lat] to [lat, lng] for Leaflet
      const polyline = coordinates.map(coord => [coord[1], coord[0]]);

      return {
        polyline,
        distance: summary.distance, // in meters
        duration: summary.duration  // in seconds
      };

    } catch (error) {
      console.error('❌ OpenRouteService Error:', error.response?.data || error.message);
      // Fallback: Return a straight line if API fails
      return {
        polyline: [[startLat, startLng], [endLat, endLng]],
        distance: 0,
        duration: 0,
        fallback: true
      };
    }
  }
}

module.exports = RouteService;
