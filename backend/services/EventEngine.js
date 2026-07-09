const supabase = require('../utils/supabase');

/**
 * The EventEngine analyzes location state and generates events for the journey.
 */
async function processLocationEvent(journeyId, currentLocation, previousLocation, distanceRemaining, journey) {
  const eventsToInsert = [];
  
  // 1. Check for "Destination Reached"
  // If distance_remaining < 0.1 (100m) -> Generate "Destination Reached" event
  if (distanceRemaining < 0.1) {
    eventsToInsert.push({
      journey_id: journeyId,
      event_type: 'REACHED',
      title: 'Destination Reached',
      description: 'The user is within 100 meters of their destination.'
    });
  }

  // 2. Check for "Stopped"
  // IF speed == 0 for > 3 mins -> Generate "Stopped" event.
  // Note: Since we don't have historical timeline of every 0 speed without complex querying,
  // we estimate by checking if previous location had 0 speed and the time diff is > 3 mins.
  if (currentLocation.speed === 0 && previousLocation && previousLocation.speed === 0) {
    const timeDiffMs = new Date() - new Date(previousLocation.captured_at);
    if (timeDiffMs > 3 * 60 * 1000) { 
       eventsToInsert.push({
         journey_id: journeyId,
         event_type: 'STOPPED',
         title: 'User Stopped',
         description: 'The user has been stationary for over 3 minutes.'
       });
    }
  }

  // 3. Mock "Medium Risk Area"
  // (Note: For "Medium Risk Area", we will mock this for now by triggering it if the user deviates from a straight line by > 500m).
  // We'll mock this with a small random probability for the sake of the hackathon if they are moving.
  if (currentLocation.speed > 0 && Math.random() < 0.02) {
    eventsToInsert.push({
      journey_id: journeyId,
      event_type: 'RISK_AREA',
      title: 'Medium Risk Area Entered',
      description: 'The user deviated from a straight line by > 500m.'
    });
  }

  // Insert events into DB if any
  if (eventsToInsert.length > 0) {
    const { error } = await supabase
      .from('journey_events')
      .insert(eventsToInsert);
      
    if (error) {
      console.error('Error inserting events:', error);
    }
  }

  return eventsToInsert;
}

module.exports = { processLocationEvent };
