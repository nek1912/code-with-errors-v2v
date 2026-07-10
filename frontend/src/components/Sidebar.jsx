import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, Bot, Users, AlertTriangle, FolderLock, BookOpen, Settings, Shield
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/user/home' },
  { id: 'ai', label: 'Aura AI', icon: Bot, path: '/user/ai' },
  { id: 'guardian', label: 'Guardian', icon: Users, path: '/user/invite-guardian' },
  { id: 'vault', label: 'Evidence', icon: FolderLock, path: '/user/evidence' },
  { id: 'learning', label: 'Learn', icon: BookOpen, path: '/user/learn' },
  { id: 'profile', label: 'Settings', icon: Settings, path: '/user/profile' },
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
            backgroundColor: 'rgba(255, 255, 255, 0)',
          },
          hover: { 
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          },
          active: { 
            backgroundColor: 'rgba(0, 229, 255, 0.08)',
          }
        }}
        transition={{ duration: 0.2 }}
        className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl mb-1 cursor-pointer transition-all duration-200 group ${
          isActive ? 'text-cyan' : 'text-dim hover:text-white/80'
        }`}
      >
        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="activeNav"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-cyan rounded-r-full shadow-glow-cyan"
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}

        <item.icon className={`w-[18px] h-[18px] transition-colors duration-200 ${
          isActive ? 'text-cyan drop-shadow-[0_0_6px_rgba(0,229,255,0.5)]' : 'text-muted group-hover:text-white/60'
        }`} />
        
        <span className="font-medium text-sm tracking-wide">
          {item.label}
        </span>
      </motion.div>
    </NavLink>
  );
}

export default function Sidebar({ isGuardian }) {
  const location = useLocation();

  const particles = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 20,
    }));
  }, []);

  return (
    <div className="hidden md:flex flex-col w-[260px] h-screen bg-obsidian border-r border-white/5 relative overflow-hidden shrink-0">
      {/* Subtle background effects */}
      <div className="absolute inset-0 bg-grain pointer-events-none opacity-30" />
      <div className="absolute top-0 left-0 w-40 h-40 bg-cyan/5 rounded-full blur-[80px] pointer-events-none" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-cyan/20"
            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.1, 0.4, 0.1] }}
            transition={{ repeat: Infinity, duration: p.duration, ease: 'linear' }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-4">
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan to-violet flex items-center justify-center shadow-glow-cyan">
            <Shield className="w-5 h-5 text-void" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-white tracking-tight">SafeSphere</h1>
            <p className="text-[9px] text-muted uppercase tracking-[0.15em]">{isGuardian ? 'Guardian Mode' : 'Safety Platform'}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-1">
          {navItems.map(item => {
            const isActive = location.pathname.includes(item.path) && item.path !== '#';
            return <NavItem key={item.id} item={item} isActive={isActive} />;
          })}
        </nav>

        {/* Emergency shortcut */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <NavLink to="/user/emergency">
            <motion.div 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full py-3.5 rounded-xl bg-magenta/10 border border-magenta/20 cursor-pointer flex items-center justify-center gap-2 overflow-hidden group transition-all hover:bg-magenta/15 hover:border-magenta/30"
            >
              <motion.div 
                className="absolute inset-0 bg-magenta/10"
                animate={{ opacity: [0.05, 0.15, 0.05] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              />
              <AlertTriangle className="w-4 h-4 text-magenta relative z-10" />
              <span className="text-magenta font-display font-bold text-xs uppercase tracking-widest relative z-10">Emergency</span>
            </motion.div>
          </NavLink>
        </div>
      </div>
    </div>
  );
}
