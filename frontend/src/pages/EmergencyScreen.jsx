import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Phone, MapPin, Mic, Video, Shield, Send, Loader2,
  Clock, CheckCircle, Circle, Users, Radio, X, StopCircle, FileText
} from 'lucide-react';
import { useEmergencyStore } from '../store/useEmergencyStore';
import { useAppStore } from '../store/useAppStore';
import api from '../services/api';

export default function EmergencyScreen() {
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordType, setRecordType] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [locationShared, setLocationShared] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(false);
  const audioChunksRef = useRef([]);
  const videoChunksRef = useRef([]);
  const streamRef = useRef(null);

  const user = useAppStore(state => state.user);
  const emergencyContacts = useAppStore(state => state.emergencyContacts);
  const {
    isEmergencyMode, startEmergency, stopEmergency,
    emergencyAlerts, sendEmergencyMessage, isLoading, location
  } = useEmergencyStore();

  const handleToggleEmergency = () => {
    if (isEmergencyMode) {
      stopEmergency();
      setCountdown(null);
    } else {
      setCountdown(3);
    }
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      startEmergency();
      setCountdown(null);
      notifyGuardians();
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const notifyGuardians = async () => {
    try {
      await api.post('/api/emergency/activate', {
        location: location,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to notify guardians:', err);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendEmergencyMessage(message);
    setMessage('');
    try {
      api.post('/api/emergency/message', { message });
    } catch {}
  };

  const handleShareLocation = async () => {
    setSharingLocation(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            try {
              await api.post('/api/emergency/location', { location: loc });
            } catch {}
            setLocationShared(true);
            setSharingLocation(false);
          },
          () => {
            setSharingLocation(false);
            alert('Unable to get your location. Please enable location services.');
          },
          { enableHighAccuracy: true }
        );
      }
    } catch {
      setSharingLocation(false);
    }
  };

  const startRecording = async (type) => {
    try {
      const constraints = type === 'video'
        ? { video: { facingMode: 'environment' }, audio: true }
        : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, {
        mimeType: type === 'video' ? 'video/webm' : 'audio/webm'
      });

      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: type === 'video' ? 'video/webm' : 'audio/webm' });
        const formData = new FormData();
        formData.append('file', blob, `emergency-${type}-${Date.now()}.webm`);
        formData.append('type', type);
        formData.append('timestamp', new Date().toISOString());
        if (location) {
          formData.append('location', JSON.stringify(location));
        }

        try {
          await api.post('/api/evidence/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } catch {}

        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      setRecordType(type);

      if (type === 'video') {
        setTimeout(() => {
          if (recorder.state === 'recording') {
            recorder.stop();
            setRecording(false);
            setRecordType(null);
          }
        }, 30000);
      }
    } catch (err) {
      console.error('Recording failed:', err);
      alert('Unable to access camera/microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    setRecording(false);
    setRecordType(null);
  };

  const handleCallEmergency = (number) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Countdown Overlay */}
      <AnimatePresence>
        {countdown !== null && countdown > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-center"
            >
              <div className="w-32 h-32 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-display-xl font-display text-error">{countdown}</span>
              </div>
              <p className="text-on-dark text-body">Activating Emergency SOS...</p>
              <button
                onClick={() => setCountdown(null)}
                className="btn-ghost text-on-dark-soft mt-4"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Toggle */}
      <motion.div
        animate={isEmergencyMode ? { scale: [1, 1.01, 1] } : {}}
        transition={{ repeat: isEmergencyMode ? Infinity : 0, duration: 2 }}
        className={`rounded-xl border-2 ${
          isEmergencyMode
            ? 'bg-error/5 border-error'
            : 'bg-canvas border-hairline hover:border-error/30'
        } transition-colors`}
      >
        <div className="p-6 flex items-center gap-5">
          <button
            onClick={handleToggleEmergency}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shrink-0 ${
              isEmergencyMode
                ? 'bg-error text-on-error shadow-lg shadow-error/30 animate-pulse'
                : 'bg-surface-soft text-error border-2 border-error/20 hover:bg-error/10'
            }`}
          >
            <AlertTriangle className="w-8 h-8" />
          </button>
          <div className="flex-1">
            <h2 className="font-display text-display-sm text-ink">
              {isEmergencyMode ? 'Emergency Active' : 'Emergency SOS'}
            </h2>
            <p className="text-body-sm text-muted mt-1">
              {isEmergencyMode
                ? 'Your guardians have been notified with your live location'
                : 'Press to activate emergency mode and alert your guardians'
              }
            </p>
            {isEmergencyMode && location && (
              <div className="flex items-center gap-2 mt-2 text-caption text-success">
                <MapPin className="w-3 h-3" />
                <span>Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Emergency Contacts */}
      <div>
        <h3 className="text-title-md text-ink mb-3">Emergency Contacts</h3>
        <div className="grid grid-cols-3 gap-2">
          {emergencyContacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => handleCallEmergency(contact.number)}
              className="card-cream p-3 text-center hover:shadow-md transition-all"
            >
              <Phone className="w-5 h-5 text-error mx-auto mb-1" />
              <p className="text-body-sm font-medium text-ink">{contact.name}</p>
              <p className="text-caption text-muted-soft">{contact.number}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-title-md text-ink mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleShareLocation}
            disabled={sharingLocation || locationShared}
            className={`card-cream p-4 flex items-center gap-3 transition-all ${
              locationShared ? 'border-2 border-success bg-success/5' : 'hover:shadow-md'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              locationShared ? 'bg-success/10' : 'bg-primary/10'
            }`}>
              {sharingLocation ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : (
                <MapPin className={`w-5 h-5 ${locationShared ? 'text-success' : 'text-primary'}`} />
              )}
            </div>
            <div className="text-left">
              <p className="text-body-sm font-medium text-ink">
                {locationShared ? 'Location Shared' : 'Share Location'}
              </p>
              <p className="text-caption text-muted-soft">
                {locationShared ? 'Guardians can see you' : 'Send live GPS'}
              </p>
            </div>
          </button>

          <button
            onClick={() => recording ? stopRecording() : startRecording('video')}
            className={`card-cream p-4 flex items-center gap-3 transition-all ${
              recording && recordType === 'video' ? 'border-2 border-error bg-error/5' : 'hover:shadow-md'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              recording && recordType === 'video' ? 'bg-error/10' : 'bg-accent-teal/10'
            }`}>
              {recording && recordType === 'video' ? (
                <StopCircle className="w-5 h-5 text-error animate-pulse" />
              ) : (
                <Video className="w-5 h-5 text-accent-teal" />
              )}
            </div>
            <div className="text-left">
              <p className="text-body-sm font-medium text-ink">
                {recording && recordType === 'video' ? 'Stop Recording' : 'Record Video'}
              </p>
              <p className="text-caption text-muted-soft">
                {recording && recordType === 'video' ? 'Recording...' : '30s clip auto-saves'}
              </p>
            </div>
          </button>

          <button
            onClick={() => recording ? stopRecording() : startRecording('audio')}
            className={`card-cream p-4 flex items-center gap-3 transition-all ${
              recording && recordType === 'audio' ? 'border-2 border-error bg-error/5' : 'hover:shadow-md'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              recording && recordType === 'audio' ? 'bg-error/10' : 'bg-accent-amber/10'
            }`}>
              {recording && recordType === 'audio' ? (
                <StopCircle className="w-5 h-5 text-error animate-pulse" />
              ) : (
                <Mic className="w-5 h-5 text-accent-amber" />
              )}
            </div>
            <div className="text-left">
              <p className="text-body-sm font-medium text-ink">
                {recording && recordType === 'audio' ? 'Stop Recording' : 'Record Audio'}
              </p>
              <p className="text-caption text-muted-soft">
                {recording && recordType === 'audio' ? 'Recording...' : 'Auto-uploads when done'}
              </p>
            </div>
          </button>

          <button
            onClick={() => handleCallEmergency('112')}
            className="card-cream p-4 flex items-center gap-3 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-error" />
            </div>
            <div className="text-left">
              <p className="text-body-sm font-medium text-ink">Call 112</p>
              <p className="text-caption text-muted-soft">Emergency services</p>
            </div>
          </button>
        </div>
      </div>

      {/* Safety Checklist */}
      {isEmergencyMode && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-title-md text-ink mb-3">Safety Checklist</h3>
          <div className="card-cream rounded-xl overflow-hidden divide-y divide-hairline-soft">
            {[
              { key: 'guardianNotified', label: 'Guardians notified', icon: Users },
              { key: 'locationShared', label: 'Location shared', icon: MapPin },
              { key: 'audioStarted', label: 'Audio recording active', icon: Mic },
              { key: 'safePlaceFound', label: 'Found safe location', icon: Shield },
            ].map((item) => {
              const Icon = item.icon;
              const completed = useAppStore.getState().emergencyChecklist[item.key];
              return (
                <div key={item.key} className="flex items-center gap-3 px-4 py-3">
                  {completed ? (
                    <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-soft shrink-0" />
                  )}
                  <Icon className={`w-4 h-4 ${completed ? 'text-success' : 'text-muted-soft'}`} />
                  <span className={`text-body-sm ${completed ? 'text-ink' : 'text-muted'}`}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Guardian Chat */}
      <div>
        <h3 className="text-title-md text-ink mb-3">Guardian Chat</h3>
        <div className="card-cream rounded-xl overflow-hidden">
          <div className="p-4 max-h-64 overflow-y-auto space-y-3">
            {emergencyAlerts.length === 0 && (
              <div className="text-center py-8">
                <Radio className="w-8 h-8 text-muted-soft mx-auto mb-2" />
                <p className="text-body-sm text-muted-soft">
                  No messages yet. Send an update to your guardians.
                </p>
              </div>
            )}
            {emergencyAlerts.map((alert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-body-sm text-ink">{alert.message}</p>
                  <p className="text-caption text-muted-soft mt-0.5">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="border-t border-hairline-soft p-3 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Send message to guardians..."
              className="input-field flex-1"
              style={{ paddingLeft: '14px' }}
            />
            <button type="submit" disabled={isLoading || !message.trim()} className="btn-primary btn-sm">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
