import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function FloatingParticles({ count = 20, isHovered = false, isEmergency = false }) {
  // Generate random particles once
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 1,
      angle: Math.random() * 360,
      distance: Math.random() * 80 + 140, // Distance from center
      duration: Math.random() * 10 + 15, // Base orbit speed
    }));
  }, [count]);

  const color = isEmergency ? 'bg-red-500' : 'bg-gold-500';

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {particles.map((p) => {
        // Speed up when hovered or emergency
        const speedMultiplier = isEmergency ? 0.2 : (isHovered ? 0.4 : 1);
        
        return (
          <motion.div
            key={p.id}
            className={`absolute rounded-full ${color} mix-blend-screen opacity-70`}
            style={{
              width: p.size,
              height: p.size,
            }}
            animate={{
              rotate: [p.angle, p.angle + 360],
              x: [Math.cos(p.angle) * p.distance, Math.cos(p.angle) * p.distance], // Center anchor trick
            }}
            transition={{
              rotate: {
                repeat: Infinity,
                duration: p.duration * speedMultiplier,
                ease: 'linear',
              },
            }}
          >
            {/* The actual particle is offset from the rotating anchor */}
            <div 
              className="w-full h-full rounded-full shadow-[0_0_10px_currentColor]"
              style={{ transform: `translateX(${p.distance}px)` }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
