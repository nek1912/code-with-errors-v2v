import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Map, Brain, BookOpen, FolderOpen, User, LogOut,
  Shield, Menu, X, Bell, ChevronRight
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useEmergencyStore } from '../store/useEmergencyStore';
import SmartAlertsSheet from './SmartAlertsSheet';
import HudRings from './HudRings';

const navItems = [
  { path: '/user/home', label: 'Home', icon: Home },
  { path: '/user/emergency', label: 'SOS', icon: Shield },
  { path: '/user/map', label: 'Live Map', icon: Map },
  { path: '/user/ai-chat', label: 'AI Chat', icon: Brain },
  { path: '/user/learning-hub', label: 'Learning Hub', icon: BookOpen },
  { path: '/user/evidence', label: 'Evidence', icon: FolderOpen },
  { path: '/user/profile', label: 'Profile', icon: User },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const navigate = useNavigate();
  const user = useAppStore(state => state.user);
  const logout = useAppStore(state => state.logout);
  const isEmergencyMode = useEmergencyStore(state => state.isEmergencyMode);
  const emergencyAlerts = useEmergencyStore(state => state.emergencyAlerts);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-canvas border-r border-hairline-soft flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-hairline-soft">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-on-primary" />
            </div>
            <span className="font-display text-lg text-ink tracking-tight">SafeSphere</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-soft hover:text-muted p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-surface-soft text-ink'
                      : 'text-muted hover:text-body hover:bg-surface-soft/50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-primary' : 'text-muted-soft group-hover:text-muted'}`} />
                    <span>{item.label}</span>
                    {item.label === 'SOS' && isEmergencyMode && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-error animate-pulse" />
                    )}
                    {isActive && (
                      <ChevronRight className="ml-auto w-3.5 h-3.5 text-muted-soft" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-hairline-soft">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-surface-soft border border-hairline flex items-center justify-center">
              <span className="text-caption font-medium text-ink">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-medium text-ink truncate">{user?.name || 'User'}</p>
              <p className="text-caption text-muted-soft truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-body-sm text-muted hover:text-error hover:bg-error/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-[260px]">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-canvas/80 backdrop-blur-md border-b border-hairline-soft flex items-center justify-between px-5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-soft hover:text-muted p-1 -ml-1"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => setAlertsOpen(true)}
              className="relative p-2 text-muted-soft hover:text-muted hover:bg-surface-soft rounded-lg transition-all"
            >
              <Bell className="w-5 h-5" />
              {emergencyAlerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full animate-pulse" />
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 md:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* HUD Rings overlay */}
      <HudRings />

      {/* Alerts sheet */}
      <SmartAlertsSheet open={alertsOpen} onOpenChange={setAlertsOpen} />
    </div>
  );
}
