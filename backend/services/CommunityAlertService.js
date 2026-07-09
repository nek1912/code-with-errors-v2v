const supabase = require('../utils/supabase');
const { AlertType, Severity } = require('../constants/alerts');

// Inline haversine to avoid dependency issues if DistanceService didn't export it
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
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

async function checkCommunityReports(lat, lng) {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Fetch reports from last 24h
    const { data: reports, error } = await supabase
      .from('community_reports')
      .select('*')
      .gte('created_at', oneDayAgo.toISOString());

    if (error) throw error;
    if (!reports || reports.length === 0) return [];

    const activeAlerts = [];

    // Filter by Haversine distance < 500m
    reports.forEach(report => {
      const distanceMeters = calculateHaversineDistance(lat, lng, report.latitude, report.longitude);
      if (distanceMeters <= 500) {
        let type = AlertType.COMMUNITY_WARNING;
        let severity = Severity.MEDIUM;

        if (report.type === 'HARASSMENT') {
          type = AlertType.COMMUNITY_WARNING;
          severity = Severity.CRITICAL;
        } else if (report.type === 'CONSTRUCTION') {
          type = AlertType.CONSTRUCTION;
          severity = Severity.MEDIUM;
        } else if (report.type === 'ACCIDENT') {
          type = AlertType.ACCIDENT;
          severity = Severity.HIGH;
        } else if (report.type === 'POWER_OUTAGE') {
          type = AlertType.POWER_OUTAGE;
          severity = Severity.HIGH;
        }

        activeAlerts.push({
          type,
          severity,
          title: `Community Report: ${report.type}`,
          message: report.description || 'A community member reported an incident here recently.',
          recommendation: 'Stay alert and consider detouring if possible.'
        });
      }
    });

    return activeAlerts;
  } catch (error) {
    console.error('CommunityAlertService error:', error.message);
    return [];
  }
}

module.exports = { checkCommunityReports };
