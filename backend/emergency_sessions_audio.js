const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { error } = await supabase
    .from('emergency_sessions')
    .select('audio_url')
    .limit(1);

  if (error) {
    console.log("Error selecting audio_url:", error);
  } else {
    console.log("Column exists!");
  }
}

run();
