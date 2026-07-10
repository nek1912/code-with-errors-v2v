import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function EvidenceVault() {
  const { incidentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [incident, setIncident] = useState(null);
  const [files, setFiles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [notes, setNotes] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [guardianActions, setGuardianActions] = useState([]);

  useEffect(() => {
    fetchIncidentDetails();
  }, [incidentId]);

  const fetchIncidentDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(
        `http://localhost:3000/api/evidence/${incidentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIncident(data.incident);
      setFiles(data.files);
      setLocations(data.locations);
      setNotes(data.notes);
      setTimeline(data.timeline);
      setGuardianActions(data.guardianActions);
    } catch (error) {
      console.error('Error fetching incident:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3000/api/evidence/report/${incidentId}`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `incident-${incidentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="text-navy-200 hover:text-gold-400 mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Evidence Vault</h1>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              incident.status === 'ACTIVE' 
                ? 'bg-red-500/20 text-red-400' 
                : 'bg-green-500/20 text-green-400'
            }`}>
              {incident.status}
            </span>
            <span className="text-navy-200">Type: {incident.type}</span>
            <span className="text-navy-200">
              {new Date(incident.started_at).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Evidence Files */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Evidence Files</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <motion.div 
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-navy-800 border border-navy-700 rounded-xl p-4"
              >
                {file.file_type === 'IMAGE' ? (
                  <img 
                    src={file.file_url} 
                    alt="Evidence" 
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                ) : file.file_type === 'AUDIO' ? (
                  <div className="bg-navy-900 rounded-lg p-4 mb-3">
                    <audio controls className="w-full">
                      <source src={file.file_url} type="audio/mpeg" />
                    </audio>
                  </div>
                ) : null}
                <p className="text-navy-200 text-sm">
                  {new Date(file.uploaded_at).toLocaleString()}
                </p>
                <p className="text-navy-400 text-xs mt-1">
                  {file.file_size ? `${(file.file_size / 1024 / 1024).toFixed(2)} MB` : ''}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Timeline</h2>
          <div className="bg-navy-800 border border-navy-700 rounded-xl p-6">
            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-gold-500 rounded-full mt-2" />
                  <div>
                    <p className="text-white font-semibold">{event.title}</p>
                    <p className="text-navy-400 text-sm">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                    {event.description && (
                      <p className="text-navy-300 text-sm mt-1">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Location Trail */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Location Trail</h2>
          <div className="bg-navy-800 border border-navy-700 rounded-xl p-6">
            <p className="text-navy-200">
              {locations.length} location points recorded
            </p>
            <div className="mt-4 h-64 bg-navy-900 rounded-lg flex items-center justify-center">
              <p className="text-navy-400">Map visualization would go here</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Notes</h2>
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="bg-navy-800 border border-navy-700 rounded-xl p-4">
                <p className="text-white">{note.note}</p>
                <p className="text-navy-400 text-sm mt-2">
                  By {note.created_by_name} • {new Date(note.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={handleDownloadPDF}
            className="px-6 py-3 bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold rounded-xl transition-all"
          >
            Download PDF Report
          </button>
          {incident.status === 'ACTIVE' && (
            <button
              onClick={async () => {
                const token = localStorage.getItem('token');
                await axios.post(
                  `http://localhost:3000/api/evidence/close`,
                  { incidentId },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                fetchIncidentDetails();
              }}
              className="px-6 py-3 bg-royal-500 hover:bg-royal-600 text-white font-semibold rounded-xl transition-all"
            >
              Close Incident
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
