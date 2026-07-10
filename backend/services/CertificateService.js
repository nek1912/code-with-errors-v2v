const PDFDocument = require('pdfkit');
const supabase = require('../utils/supabase');

class CertificateService {
  static async generateCertificate(userId, lessonId) {
    try {
      // 1. Fetch lesson details
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('title')
        .eq('id', lessonId)
        .single();
        
      if (lessonError) throw lessonError;

      // For now, use a mock username if we don't have a users table join readily available
      const userName = "SafeSphere User"; 

      // 2. Generate PDF in memory
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));

      // Design the certificate
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#1f2937'); // Dark background
      
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .lineWidth(4)
         .stroke('#3b82f6'); // Blue border
         
      doc.fillColor('#ffffff')
         .fontSize(40)
         .font('Helvetica-Bold')
         .text('Certificate of Completion', 0, 150, { align: 'center' });
         
      doc.fillColor('#9ca3af')
         .fontSize(20)
         .font('Helvetica')
         .text('This certifies that', 0, 230, { align: 'center' });
         
      doc.fillColor('#60a5fa')
         .fontSize(35)
         .font('Helvetica-Bold')
         .text(userName, 0, 270, { align: 'center' });
         
      doc.fillColor('#9ca3af')
         .fontSize(20)
         .font('Helvetica')
         .text('has successfully completed the lesson:', 0, 330, { align: 'center' });
         
      doc.fillColor('#ffffff')
         .fontSize(25)
         .font('Helvetica-Bold')
         .text(`"${lesson.title}"`, 0, 380, { align: 'center' });
         
      const dateString = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.fillColor('#9ca3af')
         .fontSize(16)
         .font('Helvetica')
         .text(`Issued on: ${dateString}`, 0, 480, { align: 'center' });

      // Finalize PDF
      doc.end();

      // Wait for buffers to fill
      const pdfBuffer = await new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);
      });

      // 3. Upload to Supabase Storage
      const filePath = `certificates/${userId}/${lessonId}-${Date.now()}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(filePath, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 4. Get public URL
      const { data: urlData } = supabase.storage
        .from('certificates')
        .getPublicUrl(filePath);

      const fileUrl = urlData.publicUrl;

      // 5. Save to database
      const { error: dbError } = await supabase
        .from('certificates')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          certificate_url: fileUrl
        });

      if (dbError) throw dbError;

      return { success: true, url: fileUrl };

    } catch (error) {
      console.error('Error generating certificate:', error);
      throw error;
    }
  }
}

module.exports = CertificateService;
