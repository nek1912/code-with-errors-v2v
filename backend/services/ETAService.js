/**
 * Calculates the Estimated Time of Arrival (ETA).
 * @param {number} distanceRemaining - Distance left in km.
 * @param {number} currentSpeed - Speed in km/h. Default is 5 (walking speed).
 * @returns {Date} The estimated time of arrival as a Date object.
 */
function calculateETA(distanceRemaining, currentSpeed = 5) {
  // Fallback to 5km/h walking speed if speed is 0 or undefined to prevent infinity
  const speed = currentSpeed > 0 ? currentSpeed : 5; 
  
  // Time in hours = distance / speed
  const timeInHours = distanceRemaining / speed;
  const timeInMs = timeInHours * 60 * 60 * 1000;
  
  const eta = new Date(Date.now() + timeInMs);
  return eta;
}

module.exports = { calculateETA };
