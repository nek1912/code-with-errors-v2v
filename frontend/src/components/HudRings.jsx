import React from 'react';
import { motion } from 'framer-motion';

export default function HudRings({ color = '#F59E0B', speed = 20, direction = 1, scale = 1, isEmergency = false }) {
  // Complex concentric rings to simulate a futuristic AI HUD
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
      style={{ scale }}
      animate={{ rotate: direction * 360 }}
      transition={{ 
        repeat: Infinity, 
        duration: speed, 
        ease: 'linear' 
      }}
    >
      <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        
        {/* Outer dashed ring */}
        <motion.circle 
          cx="200" cy="200" r="180" 
          stroke={color} 
          strokeWidth="2" 
          strokeDasharray="4 12" 
          strokeOpacity="0.6"
          animate={{ stroke: isEmergency ? '#DC2626' : color }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Outer tracking segments */}
        <motion.circle 
          cx="200" cy="200" r="170" 
          stroke={color} 
          strokeWidth="4" 
          strokeDasharray="60 140" 
          strokeOpacity="0.8"
          animate={{ stroke: isEmergency ? '#DC2626' : color }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Middle fine ring */}
        <motion.circle 
          cx="200" cy="200" r="150" 
          stroke={color} 
          strokeWidth="1" 
          strokeOpacity="0.4"
          animate={{ stroke: isEmergency ? '#EF4444' : color }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Inner complex tracker */}
        <motion.circle 
          cx="200" cy="200" r="130" 
          stroke={color} 
          strokeWidth="8" 
          strokeDasharray="10 30" 
          strokeOpacity="0.5"
          animate={{ stroke: isEmergency ? '#B91C1C' : color }}
          transition={{ duration: 0.5 }}
        />

        {/* Small tech detailing dots */}
        <motion.circle 
          cx="200" cy="200" r="110" 
          stroke={color} 
          strokeWidth="3" 
          strokeDasharray="2 18" 
          strokeOpacity="0.7"
          animate={{ stroke: isEmergency ? '#DC2626' : color }}
          transition={{ duration: 0.5 }}
        />
      </svg>
    </motion.div>
  );
}
