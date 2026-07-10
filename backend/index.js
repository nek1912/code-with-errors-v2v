require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');

const app = express();
const authMiddleware = require('./middleware/auth');

app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role for backend!
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Setup Multer for file uploads (in-memory for now)
const upload = multer({ storage: multer.memoryStorage() });

// Health Check
app.get('/', (req, res) => {
  res.send('SafeSphere Backend is Live 🛡️ (Powered by Supabase)');
});

// ==========================================
// FEATURE ROUTES WILL GO HERE
// ==========================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/ai', authMiddleware, require('./routes/aiCompanion'));
app.use('/api/journey', authMiddleware, require('./routes/journey'));
app.use('/api/guardian', authMiddleware, require('./routes/guardian'));
app.use('/api/emergency', authMiddleware, require('./routes/emergency'));
app.use('/api/evidence', require('./routes/evidence'));
app.use('/api/learning', require('./routes/learning'));
app.use('/api/admin', authMiddleware, require('./routes/admin'));
app.use('/api/alerts', authMiddleware, require('./routes/alerts'));
app.use('/api/reports', authMiddleware, require('./routes/reports'));
app.use('/api/notifications', authMiddleware, require('./routes/notifications').router);
app.use('/api/route', require('./routes/route'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 SafeSphere Server running on port ${PORT}`);
});
