import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Shield, Bell, Lock, Save, Loader2, Plus, Trash2,
  MapPin, Eye, EyeOff, ChevronRight, Check, AlertTriangle, Camera
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import api from '../services/api';

export default function ProfileDashboard() {
  const user = useAppStore(state => state.user);
  const emergencyContacts = useAppStore(state => state.emergencyContacts);
  const addEmergencyContact = useAppStore(state => state.addEmergencyContact);
  const removeEmergencyContact = useAppStore(state => state.removeEmergencyContact);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Settings state
  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    sms: true,
    emergency: true,
    location: true,
    marketing: false,
  });
  const [privacy, setPrivacy] = useState({
    shareLocation: true,
    showOnline: true,
    allowSearch: false,
    dataCollection: true,
  });
  const [newContact, setNewContact] = useState({ name: '', number: '', type: 'personal' });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/api/user/profile', { name, email, phone });
    } catch {}
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newContact.name || !newContact.number) return;
    addEmergencyContact({ ...newContact, id: Date.now() });
    setNewContact({ name: '', number: '', type: 'personal' });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'contacts', label: 'Emergency Contacts', icon: Phone },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-display-md text-ink" style={{ letterSpacing: '-0.02em' }}>
          Profile & Settings
        </h1>
        <p className="text-body text-muted mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Header */}
      <div className="card-cream rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-surface-soft border-2 border-hairline flex items-center justify-center">
              <span className="text-display-sm font-display text-ink">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-active transition-colors">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-title-md font-body font-medium text-ink">{user?.name || 'User'}</h2>
            <p className="text-body-sm text-muted">{user?.email}</p>
            <span className="badge-coral mt-1">{user?.role || 'user'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-surface-soft border border-hairline rounded-lg p-1 overflow-x-auto gap-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-button font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-canvas text-ink shadow-hairline border border-hairline'
                  : 'text-muted hover:text-body'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <form onSubmit={handleSaveProfile} className="card-cream rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-caption text-muted mb-1.5 font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-soft" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
            <div>
              <label className="block text-caption text-muted mb-1.5 font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-soft" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
            <div>
              <label className="block text-caption text-muted mb-1.5 font-medium">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-soft" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <Save className="w-4 h-4" />
                  {saved ? 'Saved!' : 'Save Changes'}
                </>
              )}
            </button>
          </form>
        </motion.div>
      )}

      {activeTab === 'notifications' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-cream rounded-xl p-6 space-y-4">
          <h3 className="text-title-md text-ink mb-4">Notification Preferences</h3>
          {[
            { key: 'push', label: 'Push Notifications', desc: 'Receive alerts on your device' },
            { key: 'email', label: 'Email Notifications', desc: 'Get updates via email' },
            { key: 'sms', label: 'SMS Alerts', desc: 'Text message notifications' },
            { key: 'emergency', label: 'Emergency Alerts', desc: 'Critical safety notifications' },
            { key: 'location', label: 'Location Alerts', desc: 'Geofencing and location updates' },
            { key: 'marketing', label: 'Marketing', desc: 'News and feature updates' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-body-sm font-medium text-ink">{item.label}</p>
                <p className="text-caption text-muted-soft">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key] }))}
                className={`w-11 h-6 rounded-full transition-colors ${
                  notifications[item.key] ? 'bg-primary' : 'bg-surface-soft border border-hairline'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  notifications[item.key] ? 'translate-x-5.5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </motion.div>
      )}

      {activeTab === 'privacy' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-cream rounded-xl p-6 space-y-4">
          <h3 className="text-title-md text-ink mb-4">Privacy Settings</h3>
          {[
            { key: 'shareLocation', label: 'Share Location', desc: 'Allow guardians to see your location' },
            { key: 'showOnline', label: 'Show Online Status', desc: 'Let others see when you are active' },
            { key: 'allowSearch', label: 'Allow Search', desc: 'Let others find you by email or phone' },
            { key: 'dataCollection', label: 'Usage Analytics', desc: 'Help improve the app with anonymous data' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-body-sm font-medium text-ink">{item.label}</p>
                <p className="text-caption text-muted-soft">{item.desc}</p>
              </div>
              <button
                onClick={() => setPrivacy(p => ({ ...p, [item.key]: !p[item.key] }))}
                className={`w-11 h-6 rounded-full transition-colors ${
                  privacy[item.key] ? 'bg-primary' : 'bg-surface-soft border border-hairline'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  privacy[item.key] ? 'translate-x-5.5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </motion.div>
      )}

      {activeTab === 'contacts' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Add Contact Form */}
          <form onSubmit={handleAddContact} className="card-cream rounded-xl p-5">
            <h3 className="text-body font-medium text-ink mb-3">Add Emergency Contact</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                value={newContact.name}
                onChange={(e) => setNewContact(c => ({ ...c, name: e.target.value }))}
                placeholder="Contact name"
                className="input-field"
                style={{ paddingLeft: '14px' }}
              />
              <input
                type="tel"
                value={newContact.number}
                onChange={(e) => setNewContact(c => ({ ...c, number: e.target.value }))}
                placeholder="Phone number"
                className="input-field"
                style={{ paddingLeft: '14px' }}
              />
            </div>
            <button type="submit" disabled={!newContact.name || !newContact.number} className="btn-primary btn-sm w-full">
              <Plus className="w-4 h-4" />
              Add Contact
            </button>
          </form>

          {/* Contact List */}
          <div className="card-cream rounded-xl overflow-hidden divide-y divide-hairline-soft">
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="flex items-center gap-3 px-5 py-4">
                <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-error" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-medium text-ink">{contact.name}</p>
                  <p className="text-caption text-muted-soft">{contact.number}</p>
                </div>
                <span className="badge-pill text-caption">{contact.type}</span>
                <button
                  onClick={() => removeEmergencyContact(contact.id)}
                  className="text-muted-soft hover:text-error transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="card-cream rounded-xl p-6 space-y-4">
            <h3 className="text-title-md text-ink">Change Password</h3>
            <div>
              <label className="block text-caption text-muted mb-1.5 font-medium">Current Password</label>
              <input type="password" className="input-field" style={{ paddingLeft: '14px' }} placeholder="Enter current password" />
            </div>
            <div>
              <label className="block text-caption text-muted mb-1.5 font-medium">New Password</label>
              <input type="password" className="input-field" style={{ paddingLeft: '14px' }} placeholder="Enter new password" />
            </div>
            <div>
              <label className="block text-caption text-muted mb-1.5 font-medium">Confirm Password</label>
              <input type="password" className="input-field" style={{ paddingLeft: '14px' }} placeholder="Confirm new password" />
            </div>
            <button className="btn-primary w-full">
              <Lock className="w-4 h-4" />
              Update Password
            </button>
          </div>

          <div className="card-cream rounded-xl p-6">
            <h3 className="text-title-md text-ink mb-3">Two-Factor Authentication</h3>
            <p className="text-body-sm text-muted mb-4">Add an extra layer of security to your account</p>
            <button className="btn-secondary w-full">
              <Shield className="w-4 h-4 text-muted" />
              Enable 2FA
            </button>
          </div>

          <div className="card-cream rounded-xl p-6 border-2 border-error/20">
            <h3 className="text-title-md text-error mb-2">Danger Zone</h3>
            <p className="text-body-sm text-muted mb-4">Permanently delete your account and all data</p>
            <button className="btn-danger w-full">
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
