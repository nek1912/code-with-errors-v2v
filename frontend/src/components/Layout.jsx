import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const location = useLocation();
  const isGuardian = location.pathname.startsWith('/guardian');

  return (
    <div className="flex h-screen bg-navy-900 text-white overflow-hidden">
      {/* Desktop Sidebar (hidden on mobile if user view) */}
      {(!isGuardian || isGuardian) && <Sidebar />}

      {/* Main Content Area */}
      <div className="flex-1 relative w-full h-full pb-16 md:pb-0">
        <Outlet />
      </div>

      {/* Mobile Bottom Nav (visible only for user routes on small screens) */}
      {!isGuardian && (
        <div className="md:hidden absolute bottom-0 w-full h-16 bg-navy-800 border-t border-navy-700 flex justify-around items-center z-50">
          <Link to="/user/home" className="p-2 text-gray-300 hover:text-white transition-colors">Home</Link>
          <Link to="/user/ai" className="p-2 text-gray-300 hover:text-white transition-colors">Aura</Link>
          <Link to="/user/emergency" className="p-4 bg-gold-500 hover:bg-gold-400 rounded-full text-navy-900 font-bold shadow-lg transform -translate-y-4 shadow-gold-500/50 transition-transform">SOS</Link>
          <Link to="/" className="p-2 text-gray-300 hover:text-white transition-colors">Exit</Link>
        </div>
      )}
    </div>
  );
}
