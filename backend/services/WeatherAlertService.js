const axios = require('axios');
const { AlertType, Severity } = require('../constants/alerts');

async function checkWeather(lat, lng) {
  try {
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lng,
        current: 'precipitation,visibility'
      }
    });

    const data = response.data;
    if (!data || !data.current) return null;

    const precip = data.current.precipitation || 0;
    const visibility = data.current.visibility || 10000;

    if (precip > 10) {
      return {
        type: AlertType.HEAVY_RAIN,
        severity: Severity.HIGH,
        title: 'Heavy Rain',
        message: `Current rainfall is ${precip}mm/hr.`,
        recommendation: 'Seek shelter or use a safer alternative route.'
      };
    }

    if (visibility < 500) {
      return {
        type: AlertType.FOG,
        severity: Severity.MEDIUM,
        title: 'Low Visibility',
        message: 'Fog or haze is reducing visibility.',
        recommendation: 'Proceed with caution and stick to well-lit areas.'
      };
    }

    return null;
  } catch (error) {
    console.error('WeatherAlertService error:', error.message);
    return null;
  }
}

module.exports = { checkWeather };
