const supabase = require('../utils/supabase');
const { getRoutePolyline, getAddressFromCoords, getCurrentWeather } = require('./ExternalApis');

async function inviteGuardian(userId, guardianEmail, guardianPhone, relationship) {
  const { data, error } = await supabase
    .from('guardian_links')
    .insert({
      user_id: userId,
      guardian_email: guardianEmail,
      guardian_phone: guardianPhone,
      relationship,
      status: 'PENDING'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function acceptGuardian(linkId, guardianUserId) {
  const { data, error } = await supabase
    .from('guardian_links')
    .update({ status: 'ACCEPTED', guardian_user_id: guardianUserId })
    .eq('id', linkId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function listGuardians(userId) {
  const { data, error } = await supabase
    .from('guardian_links')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'ACCEPTED');

  if (error) throw error;
  return data;
}

async function getGuardianDashboard(journeyId) {
  const { data: journey, error: journeyError } = await supabase
    .from('journeys')
    .select('*')
    .eq('id', journeyId)
    .single();

  if (journeyError || !journey) throw new Error('Journey not found');

  const { data: latestLocation } = await supabase
    .from('journey_locations')
    .select('*')
    .eq('journey_id', journeyId)
    .order('captured_at', { ascending: false })
    .limit(1)
    .single();

  let address = 'Unknown';
  let weather = null;
  let safetyScore = 100;
  
  if (latestLocation) {
    address = await getAddressFromCoords(latestLocation.latitude, latestLocation.longitude);
    weather = await getCurrentWeather(latestLocation.latitude, latestLocation.longitude);
    
    if (latestLocation.eta && journey.started_at) {
       const timePassedMs = new Date() - new Date(journey.started_at);
       const minutesPassed = timePassedMs / 60000;
       
       if (minutesPassed > 60) safetyScore -= 10;
       if (latestLocation.speed === 0) safetyScore -= 5;
    }
  }

  return {
    journey,
    latestLocation,
    currentAddress: address,
    weather,
    safetyScore: Math.max(0, safetyScore)
  };
}

async function getLiveLocationWithRoute(journeyId) {
  const { data: journey } = await supabase
    .from('journeys')
    .select('*')
    .eq('id', journeyId)
    .single();

  const { data: latestLocation } = await supabase
    .from('journey_locations')
    .select('*')
    .eq('journey_id', journeyId)
    .order('captured_at', { ascending: false })
    .limit(1)
    .single();

  if (!journey || !latestLocation) return null;

  const polyline = await getRoutePolyline(
    latestLocation.latitude,
    latestLocation.longitude,
    journey.destination_lat,
    journey.destination_lng
  );

  return {
    latitude: latestLocation.latitude,
    longitude: latestLocation.longitude,
    speed: latestLocation.speed,
    polyline
  };
}

/**
 * Notifies all accepted guardians with a specific message.
 */
async function notifyGuardians(userId, journeyId, type) {
  const { data: guardians } = await supabase
    .from('guardian_links')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'ACCEPTED');

  if (guardians && guardians.length > 0) {
    const notifications = guardians.map(g => ({
      journey_id: journeyId,
      guardian_link_id: g.id,
      type: type,
      title: type === 'EMERGENCY' ? 'EMERGENCY ALERT' : 'Notification',
      message: type === 'EMERGENCY' ? 'The user has triggered an SOS alert. Please check their location immediately.' : 'New update received.',
      severity: type === 'EMERGENCY' ? 'EMERGENCY' : 'MEDIUM'
    }));

    const { error: notifError } = await supabase
      .from('guardian_notifications')
      .insert(notifications);

    if (notifError) throw notifError;
  }
}

module.exports = {
  inviteGuardian,
  acceptGuardian,
  listGuardians,
  getGuardianDashboard,
  getLiveLocationWithRoute,
  notifyGuardians
};
