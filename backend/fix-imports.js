const fs = require('fs');
const path = require('path');

const files = [
  'services/AlertEngine.js',
  'services/QuizService.js',
  'services/LearningService.js',
  'services/EvidenceService.js',
  'services/BadgeService.js',
  'services/CertificateService.js',
  'routes/learning.js',
  'routes/alerts.js'
];

files.forEach(f => {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf8');
    const newContent = content.replace("const { supabase } = require('../utils/supabase');", "const supabase = require('../utils/supabase');");
    fs.writeFileSync(p, newContent);
    console.log('Fixed', f);
  }
});
