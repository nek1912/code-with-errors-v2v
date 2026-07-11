import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, Plus, FileText, Image, Video, Mic, Calendar, ArrowRight,
  Trash2, Download, Share2, Search, Filter, Clock, Shield, Eye, X
} from 'lucide-react';
import api from '../services/api';

const fallbackEvidence = [
  { id: 1, title: 'Journey Recording — Downtown', type: 'video', date: '2026-07-08', duration: '2:34', size: '15.2 MB', location: 'Downtown Mall', encrypted: true },
  { id: 2, title: 'Audio Note — Safety Concern', type: 'audio', date: '2026-07-06', duration: '0:45', size: '1.1 MB', location: 'Transit Route 42', encrypted: true },
  { id: 3, title: 'Screenshot — Suspicious Message', type: 'image', date: '2026-07-05', duration: null, size: '0.8 MB', location: null, encrypted: true },
  { id: 4, title: 'Emergency Recording', type: 'video', date: '2026-07-04', duration: '5:12', size: '32.4 MB', location: 'Main Street', encrypted: true },
  { id: 5, title: 'Voice Memo — Incident Details', type: 'audio', date: '2026-07-03', duration: '1:23', size: '3.2 MB', location: 'Park Avenue', encrypted: true },
];

export default function EvidenceList() {
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvidence();
  }, []);

  const fetchEvidence = async () => {
    try {
      const { data } = await api.get('/api/evidence');
      setEvidence(data.evidence || data.items || data);
    } catch {
      setEvidence(fallbackEvidence);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this evidence?')) return;
    try {
      await api.delete(`/api/evidence/${id}`);
    } catch {}
    setEvidence(prev => prev.filter(e => e.id !== id));
    setSelectedEvidence(null);
  };

  const typeIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-primary" />;
      case 'audio': return <Mic className="w-4 h-4 text-accent-teal" />;
      case 'image': return <Image className="w-4 h-4 text-accent-amber" />;
      default: return <FileText className="w-4 h-4 text-muted-soft" />;
    }
  };

  const typeColor = (type) => {
    switch (type) {
      case 'video': return 'bg-primary/10';
      case 'audio': return 'bg-accent-teal/10';
      case 'image': return 'bg-accent-amber/10';
      default: return 'bg-surface-soft';
    }
  };

  const filtered = evidence.filter(e => {
    const matchType = typeFilter === 'all' || e.type === typeFilter;
    const matchSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  const stats = {
    total: evidence.length,
    video: evidence.filter(e => e.type === 'video').length,
    audio: evidence.filter(e => e.type === 'audio').length,
    image: evidence.filter(e => e.type === 'image').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-display-md text-ink" style={{ letterSpacing: '-0.02em' }}>
            Evidence Vault
          </h1>
          <p className="text-body text-muted mt-1">Encrypted, timestamped, tamper-proof</p>
        </div>
        <button onClick={() => navigate('/user/evidence/vault')} className="btn-primary btn-sm">
          <Plus className="w-4 h-4" />
          New Evidence
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-ink' },
          { label: 'Video', value: stats.video, color: 'text-primary' },
          { label: 'Audio', value: stats.audio, color: 'text-accent-teal' },
          { label: 'Images', value: stats.image, color: 'text-accent-amber' },
        ].map((stat, i) => (
          <div key={i} className="card-cream p-3 text-center">
            <p className={`text-title-md font-body font-medium ${stat.color}`}>{stat.value}</p>
            <p className="text-caption text-muted-soft">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-soft" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search evidence..."
            className="input-field"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        <div className="flex bg-surface-soft border border-hairline rounded-lg p-1">
          {['all', 'video', 'audio', 'image'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-md text-caption font-medium capitalize transition-all ${
                typeFilter === type
                  ? 'bg-canvas text-ink shadow-hairline border border-hairline'
                  : 'text-muted hover:text-body'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Evidence List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="card-cream p-5 animate-pulse">
              <div className="h-5 bg-surface-soft rounded w-2/3 mb-2" />
              <div className="h-4 bg-surface-soft rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-cream p-12 text-center">
          <FolderOpen className="w-10 h-10 text-muted-soft mx-auto mb-3" />
          <p className="text-body text-muted">No evidence found</p>
          <p className="text-body-sm text-muted-soft mt-1">
            {searchQuery ? 'Try a different search' : 'Evidence from journeys will appear here'}
          </p>
        </div>
      ) : (
        <div className="card-cream rounded-xl overflow-hidden divide-y divide-hairline-soft">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelectedEvidence(item)}
              className="flex items-center gap-4 px-5 py-4 hover:bg-surface-soft/50 transition-colors group cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-lg ${typeColor(item.type)} flex items-center justify-center shrink-0`}>
                {typeIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-body-sm font-medium text-ink truncate">{item.title}</p>
                  {item.encrypted && <Shield className="w-3 h-3 text-success shrink-0" />}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-caption text-muted-soft flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {item.date}
                  </span>
                  {item.duration && (
                    <span className="text-caption text-muted-soft flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.duration}
                    </span>
                  )}
                  <span className="text-caption text-muted-soft">{item.size}</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-soft group-hover:text-primary transition-colors" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Evidence Detail Modal */}
      <AnimatePresence>
        {selectedEvidence && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedEvidence(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card-cream rounded-xl w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 border-b border-hairline-soft flex items-center justify-between">
                <h3 className="text-title-md font-body font-medium text-ink">Evidence Details</h3>
                <button onClick={() => setSelectedEvidence(null)} className="text-muted-soft hover:text-ink">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className={`w-full h-40 rounded-lg ${typeColor(selectedEvidence.type)} flex items-center justify-center`}>
                  {typeIcon(selectedEvidence.type)}
                  <span className="ml-2 text-body text-muted capitalize">{selectedEvidence.type}</span>
                </div>
                <div>
                  <p className="text-body font-medium text-ink">{selectedEvidence.title}</p>
                  <div className="flex items-center gap-3 mt-2 text-caption text-muted-soft">
                    <span>{selectedEvidence.date}</span>
                    {selectedEvidence.duration && <span>{selectedEvidence.duration}</span>}
                    <span>{selectedEvidence.size}</span>
                  </div>
                  {selectedEvidence.location && (
                    <p className="text-body-sm text-muted mt-1">Location: {selectedEvidence.location}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary flex-1">
                    <Download className="w-4 h-4 text-muted" />
                    Download
                  </button>
                  <button className="btn-secondary flex-1">
                    <Share2 className="w-4 h-4 text-muted" />
                    Share
                  </button>
                  <button onClick={() => handleDelete(selectedEvidence.id)} className="btn-ghost text-error">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
