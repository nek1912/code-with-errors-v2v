-- 1. INCIDENTS (Main evidence container)
CREATE TABLE IF NOT EXISTS incidents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  journey_id UUID REFERENCES journeys(id),
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'SOS', 'HARASSMENT', 'MEDICAL', 'STALKING'
  status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'CLOSED'
  summary TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- 2. EVIDENCE FILES (Audio, Images, Video)
CREATE TABLE IF NOT EXISTS evidence_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL, -- 'AUDIO', 'IMAGE', 'VIDEO'
  file_url TEXT NOT NULL,
  file_size INTEGER,
  duration INTEGER, -- in seconds for audio/video
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. INCIDENT LOCATIONS (GPS trail during emergency)
CREATE TABLE IF NOT EXISTS incident_locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. INCIDENT NOTES (User/Guardian notes)
CREATE TABLE IF NOT EXISTS incident_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. GUARDIAN ACTIONS (Audit trail)
CREATE TABLE IF NOT EXISTS guardian_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  guardian_id UUID,
  guardian_name TEXT,
  action TEXT NOT NULL, -- 'NOTIFIED', 'VIEWED_DASHBOARD', 'CALLED_POLICE', 'CALLED_USER'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_incidents_user_id ON incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_incidents_journey_id ON incidents(journey_id);
CREATE INDEX IF NOT EXISTS idx_evidence_files_incident_id ON evidence_files(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_locations_incident_id ON incident_locations(incident_id);

-- ENABLE SUPABASE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE evidence_files;
ALTER PUBLICATION supabase_realtime ADD TABLE incident_locations;
