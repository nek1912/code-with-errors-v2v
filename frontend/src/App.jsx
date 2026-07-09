import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import UserHome from './pages/UserHome';
import GuardianDashboard from './pages/GuardianDashboard';
import EmergencyScreen from './pages/EmergencyScreen';
import AIChat from './pages/AIChat';
import InviteGuardian from './pages/InviteGuardian';
import GuardianInviteLanding from './pages/GuardianInviteLanding';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/invite" element={<GuardianInviteLanding />} />
        
        {/* User Routes inside Layout */}
        <Route path="/user" element={<Layout />}>
          <Route path="home" element={<UserHome />} />
          <Route path="journey/:id" element={<UserHome />} />
          <Route path="emergency" element={<EmergencyScreen />} />
          <Route path="ai" element={<AIChat />} />
          <Route path="invite-guardian" element={<InviteGuardian />} />
        </Route>
        
        {/* Guardian Routes inside Layout */}
        <Route path="/guardian" element={<Layout />}>
          <Route path="dashboard" element={<GuardianDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
