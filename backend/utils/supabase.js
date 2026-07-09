require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create a singleton instance to be reused across all backend services
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
