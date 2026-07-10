const axios = require('axios');
const supabase = require('../utils/supabase');

class AlertEngine {
  
  // 1. Check Weather (Open-Meteo - No API Key needed!)
  static async checkWeather(lat, lng) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`;
      const { data } = await axios.get(url);
      
      const current = data.current;
      const alerts = [];

      // Simple weather logic
      if (current.weather_code >= 61) { // Rain codes
        alerts.push({
          type: 'HEAVY_RAIN',
          severity: 'HIGH',
          title: 'Heavy Rain Detected',
          message: `Current temp: ${current.temperature_2m}°C. Rain is falling.`,
          recommendation: 'Seek shelter or use Route B to avoid flooded areas.'
        });
      }
      if (current.wind_speed_10m > 40) {
        alerts.push({
          type: 'STORM',
          severity: 'CRITICAL',
          title: 'High Wind Speed',
          message: 'Storm conditions detected.',
          recommendation: 'Avoid walking near tall trees or billboards.'
        });
      }
      return alerts;
    } catch (error) {
      console.error('Weather check failed:', error.message);
      return [];
    }
  }

  // 2. Check Community Reports (From DB)
  static async checkCommunityReports(lat, lng, radiusMeters = 1000) {
    try {
      // Fetch recent reports (last 24 hours)
      const { data: reports } = await supabase
        .from('community_reports')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (!reports) return [];

      // Simple distance filter (Haversine)
      const activeAlerts = [];
      reports.forEach(report => {
        const distance = AlertEngine.calculateDistance(lat, lng, report.latitude, report.longitude);
        if (distance <= radiusMeters) {
          activeAlerts.push({
            type: 'COMMUNITY_WARNING',
            severity: report.type === 'HARASSMENT' ? 'CRITICAL' : 'MEDIUM',
            title: `Community Report: ${report.type}`,
            message: report.description || 'Hazard reported nearby.',
            recommendation: 'Stay alert and consider an alternate route.'
          });
        }
      });
      return activeAlerts;
    } catch (error) {
      console.error('Community check failed:', error.message);
      return [];
    }
  }

  // Helper: Haversine distance
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; 
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // MAIN ORCHESTRATOR
  static async evaluateRoute(journeyId, userId, lat, lng) {
    console.log(`🧠 Running Alert Engine for Journey ${journeyId}...`);
    
    // 1. Gather raw alerts
    const weatherAlerts = await AlertEngine.checkWeather(lat, lng);
    const communityAlerts = await AlertEngine.checkCommunityReports(lat, lng);
    const allAlerts = [...weatherAlerts, ...communityAlerts];

    // 2. Save to DB (Supabase Realtime will push this to frontend)
    if (allAlerts.length > 0) {
      const alertsToInsert = allAlerts.map(a => ({
        journey_id: journeyId,
        user_id: userId,
        type: a.type,
        severity: a.severity,
        title: a.title,
        message: a.message,
        recommendation: a.recommendation,
        is_read: false
      }));

      await supabase.from('alerts').insert(alertsToInsert);
      console.log(`✅ Saved ${allAlerts.length} new alerts to DB`);
    }

    // 3. Generate AI Summary (Mock for now to save API calls, or use Groq if you want)
    let aiSummary = "Your route looks mostly clear. Stay aware of your surroundings.";
    if (allAlerts.some(a => a.severity === 'CRITICAL')) {
      aiSummary = "⚠️ CRITICAL: High risk detected on your route. Please consider taking an alternate path or seeking a safe zone immediately.";
    } else if (allAlerts.length > 0) {
      aiSummary = `There are ${allAlerts.length} minor alerts on your route. Proceed with caution.`;
    }

    return { newAlerts: allAlerts, aiSummary };
  }
}

module.exports = AlertEngine;
