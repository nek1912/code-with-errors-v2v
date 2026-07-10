import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  Home, BookOpen, Users, Shield, Bell, LogOut
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const navItems = [
  { path: '/guardian/dashboard', label: 'Dashboard', icon: Home },
  { path: '/guardian/learning', label: 'Resources', icon: BookOpen },
  { path: '/guardian/alerts', label: 'Alerts', icon: Bell },
  { path: '/guardian/invite', label: 'Invite', icon: Users },
];

export default function GuardianLayout() {
  const user = useAppStore(state => state.user);
  const logout = useAppStore(state => state.logout);

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-[260px] bg-canvas border-r border-hairline-soft flex flex-col">
        <div className="flex items-center gap-3 h-16 px-5 border-b border-hairline-soft">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-on-primary" />
          </div>
          <span className="font-display text-lg text-ink tracking-tight">SafeSphere</span>
          <span className="badge-coral ml-1">Guardian</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
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
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-hairline-soft">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-surface-soft border border-hairline flex items-center justify-center">
              <span className="text-caption font-medium text-ink">
                {user?.name?.charAt(0)?.toUpperCase() || 'G'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-medium text-ink truncate">{user?.name || 'Guardian'}</p>
              <p className="text-caption text-muted-soft truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-body-sm text-muted hover:text-error hover:bg-error/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-[260px]">
        <main className="flex-1 p-5 md:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
