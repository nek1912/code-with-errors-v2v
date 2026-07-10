const express = require('express');
const router = express.Router();
const RouteService = require('../services/RouteService');

// POST /api/route/directions
router.post('/directions', async (req, res) => {
  try {
    const { startLat, startLng, endLat, endLng, profile } = req.body;
    
    if (!startLat || !startLng || !endLat || !endLng) {
      return res.status(400).json({ error: 'Missing coordinates' });
    }

    const route = await RouteService.getDirections(startLat, startLng, endLat, endLng, profile);
    res.json({ success: true, route });

  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
