const supabase = require('../utils/supabase');
const { calculateDistance } = require('./DistanceService');
const { calculateETA } = require('./ETAService');
const { processLocationEvent } = require('./EventEngine');

/**
 * Handles adding a new location, checking business rules via EventEngine, 
 * and broadcasting updates to Supabase Realtime.
 */
async function processNewLocation(journeyId, latitude, longitude, speed) {
  // 1. Fetch current journey to get destination
  const { data: journey, error: journeyError } = await supabase
    .from('journeys')
    .select('*')
    .eq('id', journeyId)
    .single();

  if (journeyError || !journey) {
    throw new Error('Journey not found');
  }

  if (journey.status !== 'ACTIVE') {
    throw new Error('Journey is not active');
  }

  // 2. Fetch previous location to pass to EventEngine
  const { data: previousLocation } = await supabase
    .from('journey_locations')
    .select('*')
    .eq('journey_id', journeyId)
    .order('captured_at', { ascending: false })
    .limit(1)
    .single();

  // 3. Use DistanceService to get distance_remaining
  const distanceRemaining = calculateDistance(
    latitude, 
    longitude, 
    journey.destination_lat, 
    journey.destination_lng
  );
  
  // 4. Use ETAService to calculate new eta
  const eta = calculateETA(distanceRemaining, speed);

  // 5. Pass data to EventEngine to check for new events
  const newEvents = await processLocationEvent(
    journeyId,
    { latitude, longitude, speed, eta },
    previousLocation,
    distanceRemaining,
    journey
  );

  // 6. If Destination Reached event was generated, update journey status to 'COMPLETED'
  const reachedEvent = newEvents.find(e => e.event_type === 'REACHED');
  if (reachedEvent) {
    await supabase
      .from('journeys')
      .update({ status: 'COMPLETED', ended_at: new Date() })
      .eq('id', journeyId);
  }

  // 7. Insert location into journey_locations
  const { error: locationError } = await supabase
    .from('journey_locations')
    .insert({
      journey_id: journeyId,
      latitude,
      longitude,
      speed,
      distance_remaining: distanceRemaining,
      eta
    });

  if (locationError) {
    console.error('Error inserting location:', locationError);
  }

  // 8. SUPABASE REALTIME: Broadcast this update to a channel journey:{journeyId}
  // so the Guardian dashboard updates instantly without polling.
  const updatePayload = {
    journeyId,
    latitude,
    longitude,
    speed,
    distanceRemaining,
    eta,
    newEvents,
    status: reachedEvent ? 'COMPLETED' : journey.status
  };

  supabase.channel(`journey:${journeyId}`).send({
    type: 'broadcast',
    event: 'location_update',
    payload: updatePayload
  });

  return { success: true, distanceRemaining, eta, newEvents };
}

module.exports = { processNewLocation };
