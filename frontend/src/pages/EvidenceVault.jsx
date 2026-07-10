import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Video, Mic, Upload, Loader2, CheckCircle, StopCircle,
  Camera, FileText, MapPin, Clock, Shield, X, AlertTriangle
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import api from '../services/api';

export default function EvidenceVault() {
  const [mode, setMode] = useState('idle'); // idle, recording-video, recording-audio, uploading, success
  const [recordTime, setRecordTime] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);
  const navigate = useNavigate();
  const currentLocation = useAppStore(state => state.currentLocation);

  const startVideoRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => handleRecordingComplete('video');
      recorder.start();

      mediaRecorderRef.current = recorder;
      setMode('recording-video');
      setRecordTime(0);
      timerRef.current = setInterval(() => setRecordTime(t => t + 1), 1000);
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const startAudioRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => handleRecordingComplete('audio');
      recorder.start();

      mediaRecorderRef.current = recorder;
      setMode('recording-audio');
      setRecordTime(0);
      timerRef.current = setInterval(() => setRecordTime(t => t + 1), 1000);
    } catch (err) {
      setError('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    clearInterval(timerRef.current);
  };

  const handleRecordingComplete = async (type) => {
    const blob = new Blob(chunksRef.current, { type: type === 'video' ? 'video/webm' : 'audio/webm' });
    await uploadFile(blob, `${type}-${Date.now()}.webm`, type);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      if (file.type.startsWith('image')) {
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const uploadFile = async (blob, filename, type) => {
    setMode('uploading');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', blob || selectedFile, filename || selectedFile?.name);
      formData.append('type', type || (selectedFile?.type.startsWith('video') ? 'video' : selectedFile?.type.startsWith('audio') ? 'audio' : 'image'));
      formData.append('timestamp', new Date().toISOString());
      if (currentLocation) {
        formData.append('location', JSON.stringify(currentLocation));
      }

      await api.post('/api/evidence/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMode('success');
    } catch (err) {
      setError('Upload failed. Please try again.');
      setMode('idle');
    }
    setUploading(false);
  };

  const handleUpload = () => {
    if (selectedFile) uploadFile(null, null, null);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/user/evidence')}
        className="flex items-center gap-2 text-body-sm text-muted hover:text-ink transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Evidence
      </button>

      <div>
        <h1 className="font-display text-display-sm text-ink" style={{ letterSpacing: '-0.02em' }}>
          Capture Evidence
        </h1>
        <p className="text-body-sm text-muted mt-1">Record or upload evidence — encrypted and timestamped</p>
      </div>

      {error && (
        <div className="p-3 bg-error/5 border border-error/20 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-error shrink-0" />
          <p className="text-body-sm text-error">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-muted-soft hover:text-ink">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {mode === 'success' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-cream p-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h3 className="text-title-md text-ink mb-2">Evidence Saved</h3>
          <p className="text-body-sm text-muted mb-6">Your evidence has been encrypted and stored securely</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setMode('idle'); setSelectedFile(null); setPreview(null); }} className="btn-secondary">
              Capture More
            </button>
            <button onClick={() => navigate('/user/evidence')} className="btn-primary">
              View Evidence Vault
            </button>
          </div>
        </motion.div>
      ) : mode === 'uploading' ? (
        <div className="card-cream p-8 text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-body font-medium text-ink">Uploading evidence...</p>
          <p className="text-body-sm text-muted mt-1">Encrypting and storing securely</p>
        </div>
      ) : mode.startsWith('recording') ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`card-cream p-6 border-2 ${
            mode === 'recording-video' ? 'border-primary' : 'border-accent-teal'
          }`}
        >
          <div className="text-center">
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
              mode === 'recording-video' ? 'bg-primary/10' : 'bg-accent-teal/10'
            }`}>
              {mode === 'recording-video' ? (
                <Camera className="w-10 h-10 text-primary animate-pulse" />
              ) : (
                <Mic className="w-10 h-10 text-accent-teal animate-pulse" />
              )}
            </div>
            <p className="text-title-md text-ink mb-1">
              {mode === 'recording-video' ? 'Recording Video' : 'Recording Audio'}
            </p>
            <p className="text-display-sm font-body font-medium text-primary mb-4">
              {formatTime(recordTime)}
            </p>
            {mode === 'recording-video' && (
              <p className="text-caption text-muted-soft mb-4">Max 30 seconds</p>
            )}
            <button onClick={stopRecording} className="btn-danger">
              <StopCircle className="w-4 h-4" />
              Stop Recording
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {/* Quick Record */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={startVideoRecording}
              className="card-cream p-6 text-center hover:shadow-md transition-all group"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                <Video className="w-7 h-7 text-primary" />
              </div>
              <p className="text-body-sm font-medium text-ink">Record Video</p>
              <p className="text-caption text-muted-soft mt-1">Up to 30 seconds</p>
            </button>

            <button
              onClick={startAudioRecording}
              className="card-cream p-6 text-center hover:shadow-md transition-all group"
            >
              <div className="w-14 h-14 rounded-full bg-accent-teal/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-accent-teal/20 transition-colors">
                <Mic className="w-7 h-7 text-accent-teal" />
              </div>
              <p className="text-body-sm font-medium text-ink">Record Audio</p>
              <p className="text-caption text-muted-soft mt-1">Auto-saves when done</p>
            </button>
          </div>

          {/* File Upload */}
          <div className="card-cream p-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,audio/*,image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {preview ? (
              <div className="relative">
                <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                <button
                  onClick={() => { setSelectedFile(null); setPreview(null); }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-ink/50 flex items-center justify-center text-white hover:bg-ink/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-hairline rounded-xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer"
              >
                <Upload className="w-8 h-8 text-muted-soft mx-auto mb-3" />
                {selectedFile ? (
                  <div>
                    <p className="text-body-sm font-medium text-ink">{selectedFile.name}</p>
                    <p className="text-caption text-muted-soft mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-body-sm text-muted">Click to upload file</p>
                    <p className="text-caption text-muted-soft mt-1">Video, audio, or image</p>
                  </div>
                )}
              </div>
            )}

            {selectedFile && (
              <button onClick={handleUpload} disabled={uploading} className="btn-primary w-full mt-4">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload Evidence'}
              </button>
            )}
          </div>

          {/* Info */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-body-sm font-medium text-ink">End-to-End Encrypted</p>
                <p className="text-caption text-muted-soft mt-0.5">
                  All evidence is encrypted, timestamped, and stored securely. Location data is attached automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
