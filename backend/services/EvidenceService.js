const supabase = require('../utils/supabase');

class EvidenceService {
  // Start evidence collection when SOS triggers
  static async startIncident(journeyId, userId, type = 'SOS') {
    try {
      console.log('Starting incident for journey:', journeyId);
      
      const { data: incident, error } = await supabase
        .from('incidents')
        .insert({
          journey_id: journeyId,
          user_id: userId,
          type: type,
          status: 'ACTIVE',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Create timeline event
      await supabase.from('journey_events').insert({
        journey_id: journeyId,
        event_type: 'INCIDENT_STARTED',
        title: 'Emergency SOS Activated',
        description: 'Evidence collection started',
        created_at: new Date().toISOString()
      });

      // Log guardian action
      await this.logGuardianAction(incident.id, null, 'INCIDENT_CREATED');

      console.log('✅ Incident created:', incident.id);
      return { success: true, incidentId: incident.id };

    } catch (error) {
      console.error('❌ Error starting incident:', error);
      throw error;
    }
  }

  // Upload evidence file (audio/image/video)
  static async uploadEvidenceFile(incidentId, fileBuffer, fileName, fileType, fileSize = 0, duration = 0) {
    try {
      console.log('Uploading evidence file:', fileName);

      // Generate unique path
      const timestamp = Date.now();
      const filePath = `incidents/${incidentId}/${timestamp}-${fileName}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('evidence-vault')
        .upload(filePath, fileBuffer, {
          contentType: fileType,
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('evidence-vault')
        .getPublicUrl(filePath);

      const fileUrl = urlData.publicUrl;

      // Save to database
      const { data: evidenceFile, error: dbError } = await supabase
        .from('evidence_files')
        .insert({
          incident_id: incidentId,
          file_type: this.getFileType(fileType),
          file_url: fileUrl,
          file_size: fileSize,
          duration: duration,
          uploaded_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // START OF NEW LOGIC: Link audio to emergency session
      if (fileType.includes('audio')) {
        // 1. Get journey_id from incident
        const { data: incident } = await supabase
          .from('incidents')
          .select('journey_id')
          .eq('id', incidentId)
          .single();

        if (incident && incident.journey_id) {
          // 2. Find active emergency session for this journey
          const { data: session } = await supabase
            .from('emergency_sessions')
            .select('id')
            .eq('journey_id', incident.journey_id)
            .eq('status', 'ACTIVE')
            .single();

          if (session) {
            // 3. Update the session with the new audio URL
            await supabase
              .from('emergency_sessions')
              .update({ audio_url: fileUrl })
              .eq('id', session.id);
              
            console.log('✅ Updated emergency session with audio URL:', fileUrl);
          }
        }
      }
      // END OF NEW LOGIC

      console.log('✅ Evidence file saved:', fileUrl);
      return { success: true, fileUrl, evidenceFileId: evidenceFile.id };

    } catch (error) {
      console.error('❌ Error uploading evidence:', error);
      throw error;
    }
  }

  // Save location during incident
  static async saveIncidentLocation(incidentId, lat, lng, accuracy = 0) {
    try {
      const { data, error } = await supabase
        .from('incident_locations')
        .insert({
          incident_id: incidentId,
          latitude: lat,
          longitude: lng,
          accuracy: accuracy,
          captured_at: new Date().toISOString()
        });

      if (error) throw error;
      return { success: true };

    } catch (error) {
      console.error('❌ Error saving location:', error);
      throw error;
    }
  }

  // Add note to incident
  static async addIncidentNote(incidentId, note, userId = null, userName = 'Anonymous') {
    try {
      const { data, error } = await supabase
        .from('incident_notes')
        .insert({
          incident_id: incidentId,
          note: note,
          created_by: userId,
          created_by_name: userName,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      return { success: true };

    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }

  // Log guardian action
  static async logGuardianAction(incidentId, guardianId, action, guardianName = 'Guardian') {
    try {
      const actionMap = {
        'NOTIFIED': 'Guardian Notified',
        'VIEWED_DASHBOARD': 'Guardian Opened Dashboard',
        'CALLED_POLICE': 'Guardian Called Police',
        'CALLED_USER': 'Guardian Called User',
        'INCIDENT_CREATED': 'Incident Created'
      };

      const { data, error } = await supabase
        .from('guardian_actions')
        .insert({
          incident_id: incidentId,
          guardian_id: guardianId,
          guardian_name: guardianName,
          action: actionMap[action] || action,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      return { success: true };

    } catch (error) {
      console.error('Error logging guardian action:', error);
      throw error;
    }
  }

  // Close incident
  static async closeIncident(incidentId, summary = null) {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .update({
          status: 'CLOSED',
          ended_at: new Date().toISOString(),
          summary: summary
        })
        .eq('id', incidentId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, incident: data };

    } catch (error) {
      console.error('❌ Error closing incident:', error);
      throw error;
    }
  }

  // Get full incident details
  static async getIncidentDetails(incidentId) {
    try {
      // Get incident
      const { data: incident, error: incidentError } = await supabase
        .from('incidents')
        .select('*')
        .eq('id', incidentId)
        .single();

      if (incidentError) throw incidentError;

      // Get files
      const { data: files } = await supabase
        .from('evidence_files')
        .select('*')
        .eq('incident_id', incidentId)
        .order('uploaded_at', { ascending: true });

      // Get locations
      const { data: locations } = await supabase
        .from('incident_locations')
        .select('*')
        .eq('incident_id', incidentId)
        .order('captured_at', { ascending: true });

      // Get notes
      const { data: notes } = await supabase
        .from('incident_notes')
        .select('*')
        .eq('incident_id', incidentId)
        .order('created_at', { ascending: true });

      // Get guardian actions
      const { data: guardianActions } = await supabase
        .from('guardian_actions')
        .select('*')
        .eq('incident_id', incidentId)
        .order('created_at', { ascending: true });

      // Get timeline events from journey
      const { data: timeline } = await supabase
        .from('journey_events')
        .select('*')
        .eq('journey_id', incident.journey_id)
        .order('created_at', { ascending: true });

      return {
        incident,
        files: files || [],
        locations: locations || [],
        notes: notes || [],
        guardianActions: guardianActions || [],
        timeline: timeline || []
      };

    } catch (error) {
      console.error('❌ Error getting incident details:', error);
      throw error;
    }
  }

  // Helper: Determine file type from MIME
  static getFileType(mimeType) {
    if (mimeType.includes('audio')) return 'AUDIO';
    if (mimeType.includes('image')) return 'IMAGE';
    if (mimeType.includes('video')) return 'VIDEO';
    return 'OTHER';
  }
}

module.exports = EvidenceService;
