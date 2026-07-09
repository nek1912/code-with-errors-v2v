const express = require('express');
const supabase = require('../utils/supabase');

const router = express.Router();

// POST /api/reports/create
router.post('/create', async (req, res) => {
  try {
    const { userId, type, latitude, longitude, description } = req.body;
    if (!userId || !type || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { error } = await supabase
      .from('community_reports')
      .insert({
        user_id: userId,
        type,
        latitude,
        longitude,
        description
      });

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
