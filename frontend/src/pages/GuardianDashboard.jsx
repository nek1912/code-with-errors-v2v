import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, MapPin, Clock, AlertTriangle, Shield, Eye, Bell, UserPlus,
  ArrowRight, Phone, ChevronRight
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import api from '../services/api';

export default function GuardianDashboard() {
  const user = useAppStore(state => state.user);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [usersRes, alertsRes] = await Promise.all([
        api.get('/api/guardian/users'),
        api.get('/api/guardian/alerts'),
      ]);
      setUsers(usersRes.data.users || []);
      setAlerts(alertsRes.data.alerts || []);
    } catch {
      setUsers([
        { id: 1, name: 'Sarah', lastSeen: '2 min ago', safetyScore: 98, status: 'safe', location: 'Downtown Mall' },
        { id: 2, name: 'Rahul', lastSeen: '15 min ago', safetyScore: 72, status: 'alert', location: 'Transit Route 42' },
      ]);
      setAlerts([
        { id: 1, type: 'emergency', message: 'Emergency SOS activated', user: 'Rahul', time: '5 min ago' },
        { id: 2, type: 'location', message: 'Left safe zone', user: 'Sarah', time: '1 hour ago' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-display-md text-ink" style={{ letterSpacing: '-0.02em' }}>
            Guardian Dashboard
          </h1>
          <p className="text-body text-muted mt-1">Monitor and protect your network</p>
        </div>
        <button onClick={() => navigate('/guardian/invite')} className="btn-primary btn-sm">
          <UserPlus className="w-4 h-4" />
          Invite User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active Users', value: users.length || '2', icon: Users, color: 'text-primary' },
          { label: 'Alerts Today', value: alerts.length || '1', icon: Bell, color: 'text-accent-amber' },
          { label: 'Safe Zone', value: '100%', icon: Shield, color: 'text-success' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card-cream p-4">
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${stat.color}`} />
                <div>
                  <p className={`text-title-md font-body font-medium ${stat.color}`}>{stat.value}</p>
                  <p className="text-caption text-muted-soft">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active alerts */}
      {alerts.length > 0 && (
        <div>
          <h2 className="text-title-md text-ink mb-3">Active Alerts</h2>
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`card-cream p-4 flex items-center gap-4 border-l-4 ${
                  alert.type === 'emergency' ? 'border-l-error' : 'border-l-accent-amber'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  alert.type === 'emergency' ? 'bg-error/10' : 'bg-accent-amber/10'
                }`}>
                  <AlertTriangle className={`w-5 h-5 ${
                    alert.type === 'emergency' ? 'text-error' : 'text-accent-amber'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-medium text-ink">{alert.message}</p>
                  <p className="text-caption text-muted-soft">{alert.user} • {alert.time}</p>
                </div>
                <button className="btn-secondary btn-sm">
                  <Phone className="w-4 h-4 text-muted" />
                  Call
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Monitored users */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-title-md text-ink">Monitored Users</h2>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => (
              <div key={i} className="card-cream p-5 animate-pulse">
                <div className="h-5 bg-surface-soft rounded w-1/3 mb-2" />
                <div className="h-4 bg-surface-soft rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-cream p-5 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-soft border-2 border-hairline flex items-center justify-center shrink-0">
                    <span className="text-body font-medium text-ink">{u.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-body font-medium text-ink">{u.name}</p>
                      <span className={`badge-pill ${u.status === 'safe' ? 'bg-success/10 text-success' : 'bg-accent-amber/10 text-accent-amber'}`}>
                        {u.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-caption text-muted-soft flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {u.location}
                      </span>
                      <span className="text-caption text-muted-soft flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {u.lastSeen}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-title-md font-body font-medium ${
                      u.safetyScore >= 80 ? 'text-success' : 'text-accent-amber'
                    }`}>{u.safetyScore}</p>
                    <p className="text-caption text-muted-soft">Safety Score</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-soft group-hover:text-primary transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
