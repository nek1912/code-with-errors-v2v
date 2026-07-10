import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Phone, Brain, BookOpen, Shield, AlertTriangle,
  Users, Navigation, Clock, ArrowRight, Zap
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useEmergencyStore } from '../store/useEmergencyStore';

const quickActions = [
  { label: 'Emergency SOS', icon: AlertTriangle, path: '/user/emergency', color: 'bg-error text-on-error' },
  { label: 'Start Journey', icon: Navigation, path: '/user/map', color: 'bg-primary text-on-primary' },
  { label: 'AI Assistant', icon: Brain, path: '/user/ai-chat', color: 'bg-accent-teal text-white' },
  { label: 'Learn Safety', icon: BookOpen, path: '/user/learning-hub', color: 'bg-surface-dark text-on-dark' },
];

export default function UserHome() {
  const user = useAppStore(state => state.user);
  const navigate = useNavigate();
  const isEmergencyMode = useEmergencyStore(state => state.isEmergencyMode);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const greeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-display-md text-ink" style={{ letterSpacing: '-0.02em' }}>
          {greeting()}, {user?.name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-body text-muted mt-1">
          {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Emergency banner */}
      {isEmergencyMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-error/5 border border-error/20 rounded-xl flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-error" />
          </div>
          <div className="flex-1">
            <p className="text-body font-medium text-error">Emergency Mode Active</p>
            <p className="text-body-sm text-error/70">Your guardians are being notified in real-time</p>
          </div>
          <button onClick={() => navigate('/user/emergency')} className="btn-primary btn-sm">
            View SOS
          </button>
        </motion.div>
      )}

      {/* Quick actions grid */}
      <div>
        <h2 className="text-title-md text-ink mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                onClick={() => navigate(action.path)}
                className="card-cream p-4 text-left hover:shadow-md transition-all group cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-body-sm font-medium text-ink">{action.label}</p>
                <ArrowRight className="w-4 h-4 text-muted-soft mt-2 group-hover:text-primary transition-colors" />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Safety Score', value: '98', icon: Shield, color: 'text-success' },
          { label: 'Active Guardians', value: '2', icon: Users, color: 'text-primary' },
          { label: 'Journeys', value: '14', icon: MapPin, color: 'text-accent-teal' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card-cream p-4 flex items-center gap-3">
              <Icon className={`w-5 h-5 ${stat.color}`} />
              <div>
                <p className={`text-title-md font-body font-medium ${stat.color}`}>{stat.value}</p>
                <p className="text-caption text-muted-soft">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-title-md text-ink">Recent Activity</h2>
          <button className="text-body-sm text-primary font-medium hover:text-primary-active transition-colors">View all</button>
        </div>
        <div className="card-cream divide-y divide-hairline-soft">
          {[
            { text: 'Journey to Downtown completed', time: '2 hours ago', icon: MapPin, color: 'text-success' },
            { text: 'Guardian invite sent to Mom', time: '1 day ago', icon: Users, color: 'text-primary' },
            { text: 'Safety lesson completed: Street Awareness', time: '2 days ago', icon: BookOpen, color: 'text-accent-teal' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <Icon className={`w-4 h-4 ${item.color} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm text-ink truncate">{item.text}</p>
                </div>
                <span className="text-caption text-muted-soft whitespace-nowrap">{item.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
