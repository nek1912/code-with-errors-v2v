const AlertType = {
  HEAVY_RAIN: 'HEAVY_RAIN', 
  ROAD_CLOSED: 'ROAD_CLOSED', 
  ACCIDENT: 'ACCIDENT',
  CONSTRUCTION: 'CONSTRUCTION', 
  FESTIVAL: 'FESTIVAL', 
  POWER_OUTAGE: 'POWER_OUTAGE',
  COMMUNITY_WARNING: 'COMMUNITY_WARNING',
  FOG: 'FOG'
};

const Severity = {
  LOW: 'LOW',       // Green
  MEDIUM: 'MEDIUM', // Yellow
  HIGH: 'HIGH',     // Orange
  CRITICAL: 'CRITICAL' // Red
};

module.exports = { AlertType, Severity };
