import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();
  const isGuardian = location.pathname.startsWith('/guardian');

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Desktop Sidebar (hidden on mobile if user view) */}
      <div className={`hidden md:flex flex-col w-64 bg-gray-800 border-r border-gray-700 p-4 ${isGuardian ? 'flex' : ''}`}>
        <h1 className="text-2xl font-bold text-blue-500 mb-8">SafeSphere</h1>
        <nav className="flex-1 space-y-4">
          {!isGuardian && (
            <>
              <Link to="/user/home" className="block p-3 rounded-lg hover:bg-gray-700 transition-colors">Home</Link>
              <Link to="/user/ai" className="block p-3 rounded-lg hover:bg-gray-700 transition-colors">Aura AI</Link>
              <Link to="/user/invite-guardian" className="block p-3 rounded-lg hover:bg-gray-700 transition-colors">Invite Guardian</Link>
              <Link to="/user/emergency" className="block p-3 rounded-lg hover:bg-gray-700 text-red-500 font-bold transition-colors">SOS</Link>
            </>
          )}
          {isGuardian && (
            <Link to="/guardian/dashboard" className="block p-3 rounded-lg hover:bg-gray-700 transition-colors">Dashboard</Link>
          )}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative w-full h-full pb-16 md:pb-0">
        <Outlet />
      </div>

      {/* Mobile Bottom Nav (visible only for user routes on small screens) */}
      {!isGuardian && (
        <div className="md:hidden absolute bottom-0 w-full h-16 bg-gray-800 border-t border-gray-700 flex justify-around items-center z-50">
          <Link to="/user/home" className="p-2 text-gray-300 hover:text-white transition-colors">Home</Link>
          <Link to="/user/ai" className="p-2 text-gray-300 hover:text-white transition-colors">Aura</Link>
          <Link to="/user/emergency" className="p-4 bg-red-600 hover:bg-red-500 rounded-full text-white font-bold shadow-lg transform -translate-y-4 shadow-red-500/50 transition-transform">SOS</Link>
          <Link to="/" className="p-2 text-gray-300 hover:text-white transition-colors">Exit</Link>
        </div>
      )}
    </div>
  );
}
