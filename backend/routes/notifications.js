const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const webpush = require('../utils/webpush');

// POST /api/notifications/subscribe
router.post('/subscribe', async (req, res) => {
  try {
    const { subscription, userId } = req.body;
    
    // Save to DB
    const { error } = await supabase.from('guardian_subscriptions').upsert({
      guardian_user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth
    }, { onConflict: 'endpoint' });

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to send SOS alert
exports.sendSOSAlert = async (journeyId, userId) => {
  try {
    // 1. Find all guardians for this user
    const { data: links } = await supabase
      .from('guardian_links')
      .select('guardian_user_id')
      .eq('user_id', userId)
      .eq('status', 'ACCEPTED');

    if (!links || links.length === 0) return;

    // 2. Get their subscriptions
    const guardianIds = links.map(l => l.guardian_user_id);
    const { data: subscriptions } = await supabase
      .from('guardian_subscriptions')
      .select('*')
      .in('guardian_user_id', guardianIds);

    if (!subscriptions || subscriptions.length === 0) return;

    // 3. Send Push Notification
    const payload = JSON.stringify({
      title: '🚨 SOS EMERGENCY TRIGGERED!',
      body: 'A guardian has triggered an emergency. Open SafeSphere immediately.',
      icon: '/logo192.png',
      badge: '/badge72.png',
      url: '/guardian/dashboard'
    });

    const sendPromises = subscriptions.map(sub => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      };
      return webpush.sendNotification(pushSubscription, payload).catch(err => {
        console.error('Failed to send push to', sub.endpoint, err.message);
      });
    });

    await Promise.all(sendPromises);
    console.log(`✅ Sent SOS push to ${subscriptions.length} guardians`);

  } catch (error) {
    console.error('sendSOSAlert error:', error);
  }
};

module.exports.router = router;
