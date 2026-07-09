const supabase = require('../utils/supabase');

/**
 * Uploads a file buffer to Supabase Storage and returns the public URL.
 * @param {string} incidentId 
 * @param {Object} file - Multer file object (from memory storage)
 * @returns {string} Public URL of the uploaded file
 */
async function uploadEvidence(incidentId, file) {
  try {
    const bucketName = 'evidence-vault';
    
    // Generate a unique, safe path: incidents/{incidentId}/{timestamp}-{filename}
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}-${safeOriginalName}`;
    const filePath = `incidents/${incidentId}/${fileName}`;

    // Upload buffer to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Supabase Storage Error:', error);
      throw new Error(`Failed to upload file to storage: ${error.message}`);
    }

    // Get the public URL for frontend display and DB storage
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('StorageService Error:', error);
    throw error;
  }
}

module.exports = { uploadEvidence };
