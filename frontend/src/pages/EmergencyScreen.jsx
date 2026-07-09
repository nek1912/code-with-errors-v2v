import React, { useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

export default function EmergencyScreen() {
  const { isEmergencyActive, triggerEmergency, resetEmergency, emergencyChecklist, updateChecklist, activeJourneyId } = useAppStore();

  const handleTriggerSOS = async () => {
    triggerEmergency();
    if (activeJourneyId) {
      try {
        await axios.post('http://localhost:3000/api/journey/emergency', { journeyId: activeJourneyId });
      } catch(error) {
        console.error('Error locking journey to EMERGENCY:', error);
      }
    }
  };

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
        initial={{ backgroundColor: isEmergencyActive ? '#111827' : '#dc2626' }}
        animate={{ backgroundColor: isEmergencyActive ? '#dc2626' : '#111827' }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="flex flex-col items-center justify-center h-full w-full p-6 text-white overflow-hidden relative"
      >
        {isEmergencyActive ? (
          <div className="w-full max-w-sm flex flex-col items-center z-10">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl font-extrabold tracking-widest animate-pulse">🚨 EMERGENCY</h1>
              <p className="text-red-200 mt-2 font-bold uppercase tracking-widest">Protocol Active</p>
            </motion.div>

            <div className="w-full bg-red-900/40 rounded-2xl p-6 backdrop-blur-md shadow-2xl border border-red-500/50 mb-12">
              <h3 className="text-lg font-bold mb-4 border-b border-red-500/30 pb-2">Action Checklist</h3>
              <ul className="space-y-4">
                {checklistItems.map((item, idx) => {
                  const isDone = emergencyChecklist[item.key];
                  return (
                    <motion.li 
                      key={item.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.2 }}
                      className={`flex items-center space-x-3 text-lg font-medium transition-all duration-500 ${isDone ? 'text-white line-through opacity-70' : 'text-red-200'}`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isDone ? 'bg-green-500 border-green-500' : 'border-red-300'}`}>
                        {isDone && '✓'}
                      </div>
                      <span>{item.label}</span>
                    </motion.li>
                  );
                })}
              </ul>
            </div>

            <button 
              onClick={resetEmergency}
              className="px-6 py-3 bg-red-800/80 hover:bg-red-700 rounded-full text-sm font-bold border border-red-400/50 transition-colors"
            >
              CANCEL SOS
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center z-10">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTriggerSOS}
              className="w-64 h-64 rounded-full bg-red-600 shadow-[0_0_50px_rgba(220,38,38,0.6)] flex items-center justify-center border-8 border-red-900 focus:outline-none focus:ring-4 focus:ring-red-500 relative"
            >
              {/* Pulsing rings */}
              <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
              <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] animation-delay-500"></div>
              
              <span className="text-4xl font-extrabold tracking-wider z-10">SOS</span>
            </motion.button>
            <p className="text-gray-400 mt-12 text-lg font-medium tracking-wide">Or shake your device 3 times</p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
