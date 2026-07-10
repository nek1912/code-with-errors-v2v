const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');

// GET /api/alerts/active/:journeyId
router.get('/active/:journeyId', async (req, res) => {
  try {
    const { journeyId } = req.params;
    
    // Fetch unread alerts for this journey, ordered by newest
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('journey_id', journeyId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(10); // Only show the 10 most recent

    if (error) throw error;

    res.json({ success: true, alerts: data || [] });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/alerts/read/:id
router.patch('/read/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await supabase.from('alerts').update({ is_read: true }).eq('id', id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
