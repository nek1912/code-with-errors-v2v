const express = require('express');
const router = express.Router();
const multer = require('multer');
const supabase = require('../utils/supabase');
const EvidenceService = require('../services/EvidenceService');
const PDFService = require('../services/PDFService');
const authMiddleware = require('../middleware/auth');

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// POST /api/evidence/start
router.post('/start', authMiddleware, async (req, res) => {
  try {
    const { journeyId, type = 'SOS' } = req.body;
    const userId = req.user.id;
    
    const result = await EvidenceService.startIncident(journeyId, userId, type);
    res.json(result);
  } catch (error) {
    console.error('Error starting incident:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/evidence/upload
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { incidentId, duration } = req.body;
    const file = req.file;
    const userId = req.user.id;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const result = await EvidenceService.uploadEvidenceFile(
      incidentId,
      file.buffer,
      file.originalname,
      file.mimetype,
      file.size,
      parseInt(duration) || 0
    );

    res.json(result);
  } catch (error) {
    console.error('Error uploading evidence:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/evidence/location
router.post('/location', authMiddleware, async (req, res) => {
  try {
    const { incidentId, latitude, longitude, accuracy } = req.body;
    
    const result = await EvidenceService.saveIncidentLocation(
      incidentId, 
      latitude, 
      longitude, 
      accuracy || 0
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error saving location:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/evidence/note
router.post('/note', authMiddleware, async (req, res) => {
  try {
    const { incidentId, note } = req.body;
    const userId = req.user.id;
    const userName = req.user.email || 'User';
    
    const result = await EvidenceService.addIncidentNote(incidentId, note, userId, userName);
    res.json(result);
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/evidence/close
router.post('/close', authMiddleware, async (req, res) => {
  try {
    const { incidentId, summary } = req.body;
    
    const result = await EvidenceService.closeIncident(incidentId, summary);
    res.json(result);
  } catch (error) {
    console.error('Error closing incident:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/evidence/:incidentId
router.get('/:incidentId', authMiddleware, async (req, res) => {
  try {
    const { incidentId } = req.params;
    
    const details = await EvidenceService.getIncidentDetails(incidentId);
    res.json(details);
  } catch (error) {
    console.error('Error getting incident:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/evidence/user/:userId
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data: incidents, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, incidents: incidents || [] });
  } catch (error) {
    console.error('Error getting user incidents:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/evidence/report/:incidentId (PDF Download)
router.get('/report/:incidentId', authMiddleware, async (req, res) => {
  try {
    const { incidentId } = req.params;
    const details = await EvidenceService.getIncidentDetails(incidentId);
    
    const pdfBuffer = await PDFService.generateIncidentReport(details);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=incident-${incidentId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
