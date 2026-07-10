import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Navigation, 
  Bot, 
  Users, 
  AlertTriangle, 
  FolderLock, 
  MapPin, 
  BookOpen, 
  Bell, 
  Settings 
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/user/home' },
  { id: 'ai', label: 'AI Assistant', icon: Bot, path: '/user/ai' },
  { id: 'guardian', label: 'Guardian', icon: Users, path: '/user/invite-guardian' },
  { id: 'vault', label: 'Evidence Vault', icon: FolderLock, path: '/user/evidence' },
  { id: 'learning', label: 'Learning Hub', icon: BookOpen, path: '/user/learn' },
  { id: 'profile', label: 'Profile', icon: Settings, path: '/user/profile' },
];

function NavItem({ item, isActive }) {
  return (
    <NavLink to={item.path}>
      <motion.div
        whileHover="hover"
        initial="idle"
        animate={isActive ? "active" : "idle"}
        variants={{
          idle: { 
            scale: 1, 
            backgroundColor: 'rgba(255, 255, 255, 0)',
            borderColor: 'rgba(255, 255, 255, 0.05)',
            boxShadow: '0px 0px 0px rgba(59, 130, 246, 0)'
          },
          hover: { 
            scale: 1.02, 
            y: -2,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(59, 130, 246, 0.4)', // Blue border on hover
            boxShadow: '0px 10px 20px -10px rgba(59, 130, 246, 0.3)'
          },
          active: { 
            scale: 1.02, 
            backgroundColor: 'rgba(59, 130, 246, 0.15)', // Cyan/Blue gradient base
            borderColor: 'rgba(59, 130, 246, 0.6)',
            boxShadow: '0px 0px 20px rgba(59, 130, 246, 0.4)'
          }
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative flex items-center px-4 py-3 mb-2 rounded-[20px] backdrop-blur-md border cursor-pointer overflow-hidden group"
      >
        {/* Active Left Indicator */}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-400 rounded-r-full shadow-[0_0_10px_rgba(96,165,250,0.8)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Hover Inner Glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-blue-500/10 to-transparent pointer-events-none" />

        {/* Active Gradient Overlay */}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-600/10 pointer-events-none" />
        )}

        <item.icon 
          className={`w-5 h-5 mr-4 transition-colors duration-300 z-10 ${isActive ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-navy-600 group-hover:text-blue-400'}`} 
        />
        
        <span className={`font-medium tracking-wide z-10 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
          {item.label}
        </span>
      </motion.div>
    </NavLink>
  );
}

export default function Sidebar() {
  const location = useLocation();

  // Subtle floating particles for the AI OS background
  const particles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 20,
    }));
  }, []);

  return (
    <div className="hidden md:flex flex-col w-[280px] h-screen bg-[#07111F] border-r border-white/5 relative overflow-hidden shrink-0">
      
      {/* 1. Blue Radial Glow Overlay (30% opacity) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-600/30 via-[#07111F]/0 to-[#07111F]/0 pointer-events-none z-0" />
      
      {/* 2. Subtle Animated Grid */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
      />

      {/* 3. Soft Floating Particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-blue-400/30 blur-[1px]"
            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              repeat: Infinity,
              duration: p.duration,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Content Layer (z-10) */}
      <div className="relative z-10 flex flex-col h-full w-full p-5">
        
        {/* Logo Area */}
        <div className="flex items-center mb-10 mt-2 px-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.6)] flex items-center justify-center mr-3">
            <span className="text-white font-black text-sm">S</span>
          </div>
          <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 tracking-wide drop-shadow-[0_0_10px_rgba(59,130,246,0.4)]">
            SafeSphere
          </h1>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
          {navItems.map(item => {
            // Very simple active check matching
            const isActive = location.pathname.includes(item.path) && item.path !== '#';
            return <NavItem key={item.id} item={item} isActive={isActive} />;
          })}
        </nav>

        {/* Floating Emergency Shortcut */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <NavLink to="/user/emergency">
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full py-4 rounded-[20px] bg-red-900/30 backdrop-blur-md border border-red-500/40 cursor-pointer flex items-center justify-center overflow-hidden group shadow-[0_4px_20px_rgba(220,38,38,0.2)]"
            >
              {/* Continuous Pulse Animation */}
              <motion.div 
                className="absolute inset-0 bg-red-500/20"
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              />
              
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2 group-hover:text-red-300 drop-shadow-[0_0_5px_rgba(248,113,113,0.8)] z-10 transition-colors" />
              <span className="text-red-200 font-bold uppercase tracking-widest z-10 group-hover:text-white transition-colors">Emergency</span>
            </motion.div>
          </NavLink>
        </div>

      </div>
    </div>
  );
}
