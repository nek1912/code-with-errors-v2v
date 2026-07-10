import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import HudRings from '../components/HudRings';
import FloatingParticles from '../components/FloatingParticles';

export default function EmergencyScreen() {
  const { isEmergencyActive, triggerEmergency, resetEmergency, emergencyChecklist, updateChecklist, activeJourneyId, userId, currentLocation } = useAppStore();
  const [isHovered, setIsHovered] = useState(false);
  const [incidentId, setIncidentId] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  const handleTriggerSOS = async () => {
    triggerEmergency();
    if (activeJourneyId) {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.post('http://localhost:3000/api/evidence/start', { 
          journeyId: activeJourneyId,
          type: 'SOS'
        }, { headers: { Authorization: `Bearer ${token}` }});
        
        if (data.success) {
          setIncidentId(data.incidentId);
        }
      } catch(error) {
        console.error('Error starting evidence collection:', error);
      }
    }
  };

  const startAudioRecording = async (currentIncidentId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', audioBlob, `emergency-audio-${Date.now()}.webm`);
        formData.append('incidentId', currentIncidentId);
        formData.append('duration', '30');

        const token = localStorage.getItem('token');
        await axios.post(
          'http://localhost:3000/api/evidence/upload',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      };

      recorder.start(1000); // Collect 1 second of audio at a time
      setMediaRecorder(recorder);
    } catch (error) {
      console.error('Error starting audio recording:', error);
    }
  };

  useEffect(() => {
    if (isEmergencyActive && incidentId) {
      startAudioRecording(incidentId);
      
      // Upload location every 5 seconds
      const interval = setInterval(async () => {
        const token = localStorage.getItem('token');
        await axios.post(
          'http://localhost:3000/api/evidence/location',
          {
            incidentId,
            latitude: currentLocation?.lat || 0,
            longitude: currentLocation?.lng || 0
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }, 5000);

      return () => {
        clearInterval(interval);
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      };
    }
  }, [isEmergencyActive, incidentId]);

  // Shake detection
  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0;
    let lastTime = new Date().getTime();
    const SHAKE_THRESHOLD = 15; // m/s^2
    let shakeCount = 0;
    let lastShakeTime = 0;

    const handleMotion = (e) => {
      if (!e.accelerationIncludingGravity) return;
      const { x, y, z } = e.accelerationIncludingGravity;
      const currentTime = new Date().getTime();
      
      if ((currentTime - lastTime) > 100) {
        const diffTime = (currentTime - lastTime);
        const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;
        
        if (speed > SHAKE_THRESHOLD * 10) {
          if (currentTime - lastShakeTime > 500) {
            shakeCount++;
            lastShakeTime = currentTime;
            if (shakeCount >= 3) {
              handleTriggerSOS();
              shakeCount = 0;
            }
          }
        }
        lastX = x;
        lastY = y;
        lastZ = z;
        lastTime = currentTime;
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [triggerEmergency]);

  // Simulate Checklist
  useEffect(() => {
    if (isEmergencyActive) {
      const timers = [
        setTimeout(() => updateChecklist('guardianNotified'), 1000),
        setTimeout(() => updateChecklist('audioStarted'), 2500),
        setTimeout(() => updateChecklist('locationShared'), 4000),
        setTimeout(() => updateChecklist('safePlaceFound'), 5500),
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [isEmergencyActive, updateChecklist]);

  const checklistItems = [
    { key: 'guardianNotified', label: 'Guardian Notified' },
    { key: 'audioStarted', label: 'Audio Recording Started' },
    { key: 'locationShared', label: 'Live Location Shared' },
    { key: 'safePlaceFound', label: 'Nearest Safe Place Found' }
  ];

  return (
    <AnimatePresence>
      <motion.div 
        key={isEmergencyActive ? 'active' : 'idle'}
        initial={{ backgroundColor: isEmergencyActive ? '#0F172A' : '#1E0505' }}
        animate={{ backgroundColor: isEmergencyActive ? '#1E0505' : '#0F172A' }}
        transition={{ duration: 1, ease: 'easeInOut' }}
        className="flex flex-col items-center justify-center h-full w-full p-6 text-white overflow-hidden relative"
      >
        {/* Global Emergency Red Glow */}
        {isEmergencyActive && (
          <motion.div 
            className="absolute inset-0 bg-red-900/20 mix-blend-screen pointer-events-none"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          />
        )}

        {isEmergencyActive ? (
          <div className="w-full max-w-md flex flex-col items-center z-10">
            {/* Active Emergency HUD (Miniaturized at Top) */}
            <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
              <HudRings color="#DC2626" speed={5} direction={1} scale={0.6} isEmergency={true} />
              <HudRings color="#EF4444" speed={7} direction={-1} scale={0.5} isEmergency={true} />
              <div className="w-24 h-24 rounded-full bg-red-600/20 border-2 border-red-500 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.8)]">
                <span className="text-xl font-extrabold tracking-wider text-red-100 animate-pulse">ACTIVE</span>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', bounce: 0.4 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-extrabold tracking-widest text-red-500">EMERGENCY</h1>
              <p className="text-red-200 mt-2 font-bold uppercase tracking-widest">Protocol Engaged</p>
            </motion.div>

            {/* Checklist sliding up */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.3 }}
              className="w-full bg-navy-800/60 rounded-3xl p-6 backdrop-blur-xl shadow-2xl border border-red-500/40 mb-8"
            >
              <h3 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest border-b border-navy-700 pb-3">System Actions</h3>
              <ul className="space-y-5">
                {checklistItems.map((item, idx) => {
                  const isDone = emergencyChecklist[item.key];
                  return (
                    <motion.li 
                      key={item.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + (idx * 0.15) }}
                      className={`flex items-center space-x-4 text-base font-medium transition-all duration-500 ${isDone ? 'text-white' : 'text-navy-600'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${isDone ? 'bg-red-500 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'border-navy-600'}`}>
                        {isDone && '✓'}
                      </div>
                      <span className={isDone ? 'opacity-100' : 'opacity-50'}>{item.label}</span>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>

            <motion.button 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={resetEmergency}
              className="px-8 py-4 bg-navy-900/80 hover:bg-navy-800 rounded-full text-sm text-gray-400 font-bold border border-navy-700 transition-colors uppercase tracking-widest"
            >
              Stand Down
            </motion.button>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center z-10 relative">
            
            {/* The Futuristic HUD Container */}
            <div className="relative w-[400px] h-[400px] flex items-center justify-center">
              
              {/* Radar Pulse Rings */}
              <motion.div 
                className="absolute inset-0 rounded-full border border-gold-500/30"
                animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
              />
              <motion.div 
                className="absolute inset-0 rounded-full border border-gold-500/20"
                animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, delay: 0.5, ease: 'easeOut' }}
              />

              {/* HUD Rings layers */}
              <HudRings color="#F59E0B" speed={isHovered ? 10 : 30} direction={1} scale={isHovered ? 1.02 : 1} />
              <HudRings color="#FCD34D" speed={isHovered ? 12 : 40} direction={-1} scale={isHovered ? 0.95 : 0.9} />
              
              {/* Particles orbiting */}
              <FloatingParticles count={30} isHovered={isHovered} />

              {/* The Core SOS Button */}
              <motion.button 
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleTriggerSOS}
                className="w-48 h-48 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center border border-gold-500/50 shadow-[0_0_50px_rgba(245,158,11,0.2)] focus:outline-none relative z-20 group"
              >
                {/* Core Glow */}
                <div className={`absolute inset-0 rounded-full bg-gold-500 transition-opacity duration-500 blur-xl ${isHovered ? 'opacity-40' : 'opacity-20'}`} />
                
                {/* Glassmorphism Surface */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/10" />

                <span className="text-5xl font-extrabold tracking-widest z-10 text-gold-400 group-hover:text-gold-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] transition-colors">
                  SOS
                </span>
              </motion.button>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-16 text-center"
            >
              <p className="text-gold-500/60 text-sm font-bold uppercase tracking-[0.3em]">AI Emergency Protocol</p>
              <p className="text-navy-600 mt-2 text-xs">Tap core or shake device 3x to engage</p>
            </motion.div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
