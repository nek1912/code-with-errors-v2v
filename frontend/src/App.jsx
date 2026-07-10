import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/auth';
import { useAppStore } from './store/useAppStore';

import Layout from './components/Layout';
import GuardianLayout from './components/GuardianLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserHome from './pages/UserHome';
import EmergencyScreen from './pages/EmergencyScreen';
import LiveMap from './components/LiveMap';
import AIChat from './pages/AIChat';
import LearningHub from './pages/LearningHub';
import LessonView from './pages/LessonView';
import EvidenceList from './pages/EvidenceList';
import EvidenceVault from './pages/EvidenceVault';
import ProfileDashboard from './pages/ProfileDashboard';
import InviteGuardian from './pages/InviteGuardian';
import GuardianDashboard from './pages/GuardianDashboard';
import GuardianInviteLanding from './pages/GuardianInviteLanding';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const setUser = useAppStore(state => state.setUser);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setUser(user);
    }
  }, [setUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/invite/:token" element={<GuardianInviteLanding />} />

        {/* Protected User Routes */}
        <Route path="/user" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="home" element={<UserHome />} />
          <Route path="emergency" element={<EmergencyScreen />} />
          <Route path="map" element={<LiveMap />} />
          <Route path="ai-chat" element={<AIChat />} />
          <Route path="learning-hub" element={<LearningHub />} />
          <Route path="learning/:lessonId" element={<LessonView />} />
          <Route path="evidence" element={<EvidenceList />} />
          <Route path="evidence/vault" element={<EvidenceVault />} />
          <Route path="profile" element={<ProfileDashboard />} />
          <Route path="invite-guardian" element={<InviteGuardian />} />
        </Route>

        {/* Protected Guardian Routes */}
        <Route path="/guardian" element={<ProtectedRoute requireGuardian={true}><GuardianLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<GuardianDashboard />} />
          <Route path="learning" element={<LearningHub />} />
          <Route path="alerts" element={<EmergencyScreen />} />
          <Route path="invite" element={<InviteGuardian />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
