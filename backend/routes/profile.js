const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const supabase = require('../utils/supabase');
const authMiddleware = require('../middleware/auth');

// GET /api/profile/me - Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    // Get guardian count
    const { count: guardianCount } = await supabase
      .from('guardian_links')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .eq('status', 'ACCEPTED');

    // Get journey count
    const { count: journeyCount } = await supabase
      .from('journeys')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id);

    res.json({
      user,
      stats: {
        guardians: guardianCount || 0,
        journeys: journeyCount || 0
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/profile/update - Update profile
router.put('/update', authMiddleware, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;

    const updates = { name };
    
    // If changing password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password required' });
      }

      // Verify current password
      const { data: user } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', req.user.id)
        .single();

      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Current password incorrect' });
      }

      updates.password_hash = await bcrypt.hash(newPassword, 10);
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, user: data });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/profile/guardians - Get user's guardians
router.get('/guardians', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('guardian_links')
      .select('id, guardian_user_id, guardian_email, relationship, status, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ guardians: data || [] });
  } catch (error) {
    console.error('Guardians error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/profile/guardians/:id - Remove guardian
router.delete('/guardians/:id', authMiddleware, async (req, res) => {
  try {
    const { error } = await supabase
      .from('guardian_links')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Delete guardian error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/profile/journeys - Get journey history
router.get('/journeys', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('journeys')
      .select('id, destination_name, status, started_at, ended_at')
      .eq('user_id', req.user.id)
      .order('started_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    res.json({ journeys: data || [] });
  } catch (error) {
    console.error('Journeys error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
