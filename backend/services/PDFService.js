const PDFDocument = require('pdfkit');

class PDFService {
  static async generateIncidentReport(incidentData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // Header
        doc.fontSize(24).font('Helvetica-Bold').text('SafeSphere Incident Report', { align: 'center' });
        doc.moveDown(2);

        // Incident Details
        doc.fontSize(16).font('Helvetica-Bold').text('Incident Details');
        doc.fontSize(12).font('Helvetica');
        doc.text(`Incident ID: ${incidentData.incident.id}`);
        doc.text(`Type: ${incidentData.incident.type}`);
        doc.text(`Status: ${incidentData.incident.status}`);
        doc.text(`Started: ${new Date(incidentData.incident.started_at).toLocaleString()}`);
        if (incidentData.incident.ended_at) {
          doc.text(`Ended: ${new Date(incidentData.incident.ended_at).toLocaleString()}`);
        }
        doc.moveDown(1);

        // Evidence Summary
        doc.fontSize(16).font('Helvetica-Bold').text('Evidence Summary');
        doc.fontSize(12).font('Helvetica');
        doc.text(`Audio Files: ${incidentData.files.filter(f => f.file_type === 'AUDIO').length}`);
        doc.text(`Images: ${incidentData.files.filter(f => f.file_type === 'IMAGE').length}`);
        doc.text(`Location Points: ${incidentData.locations.length}`);
        doc.moveDown(1);

        // Timeline
        doc.fontSize(16).font('Helvetica-Bold').text('Timeline');
        doc.fontSize(10).font('Helvetica');
        incidentData.timeline.forEach(event => {
          doc.text(`${new Date(event.created_at).toLocaleTimeString()} - ${event.title}`);
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = PDFService;
