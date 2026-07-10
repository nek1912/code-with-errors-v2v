import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { FolderLock, Calendar, Clock, AlertCircle } from 'lucide-react';

export default function EvidenceList() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchIncidents();
    }
  }, [user]);

  const fetchIncidents = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(
        `http://localhost:3000/api/evidence/user/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setIncidents(data.incidents);
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/50 flex items-center justify-center mr-4">
            <FolderLock className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide">Evidence Vault</h1>
            <p className="text-navy-400 mt-1">Securely view and manage your emergency audit trails</p>
          </div>
        </div>

        {incidents.length === 0 ? (
          <div className="bg-navy-800/50 border border-navy-700 rounded-2xl p-12 text-center">
            <FolderLock className="w-16 h-16 text-navy-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Your Vault is Empty</h3>
            <p className="text-navy-400">No emergency incidents have been recorded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {incidents.map((incident) => (
              <motion.div
                key={incident.id}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/user/evidence/${incident.id}`)}
                className="bg-navy-800/80 backdrop-blur-md border border-navy-700 hover:border-blue-500/50 rounded-2xl p-6 cursor-pointer shadow-lg transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    incident.status === 'ACTIVE' 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}>
                    {incident.status}
                  </div>
                  <AlertCircle className="w-5 h-5 text-navy-500 group-hover:text-blue-400 transition-colors" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{incident.type} Incident</h3>
                
                <div className="space-y-2 mt-4 text-sm text-navy-300">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-navy-500" />
                    {new Date(incident.started_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-navy-500" />
                    {new Date(incident.started_at).toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
