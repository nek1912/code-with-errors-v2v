import React from 'react';
import { motion } from 'framer-motion';
import { useEmergencyStore } from '../store/useEmergencyStore';

export default function HudRings() {
  const isEmergencyMode = useEmergencyStore(state => state.isEmergencyMode);

  if (!isEmergencyMode) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Outer ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0.1, 0.3, 0.1], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-8 rounded-2xl border-2 border-error/20"
      />

      {/* Middle ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: [0.15, 0.4, 0.15], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
        className="absolute inset-16 rounded-xl border border-error/15"
      />

      {/* Inner ring */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
        className="absolute inset-24 rounded-lg border border-error/10"
      />

      {/* Corner accents */}
      {[
        'top-8 left-8',
        'top-8 right-8',
        'bottom-8 left-8',
        'bottom-8 right-8',
      ].map((pos, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
          className={`absolute ${pos} w-6 h-6 border-t-2 border-l-2 border-error/30 rounded-tl`}
          style={{
            borderTop: i < 2 ? '2px solid' : 'none',
            borderBottom: i >= 2 ? '2px solid' : 'none',
            borderLeft: i % 2 === 0 ? '2px solid' : 'none',
            borderRight: i % 2 !== 0 ? '2px solid' : 'none',
            borderColor: 'rgba(220, 38, 38, 0.3)',
          }}
        />
      ))}
    </div>
  );
}
