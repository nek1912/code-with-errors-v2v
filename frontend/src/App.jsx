import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/auth';
import { useAppStore } from './store/useAppStore';

import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserHome from './pages/UserHome';
import GuardianDashboard from './pages/GuardianDashboard';
import EmergencyScreen from './pages/EmergencyScreen';
import AIChat from './pages/AIChat';
import InviteGuardian from './pages/InviteGuardian';
import GuardianInviteLanding from './pages/GuardianInviteLanding';
import LearningHub from './pages/LearningHub';
import LessonView from './pages/LessonView';
import ProtectedRoute from './components/ProtectedRoute';
import EvidenceList from './pages/EvidenceList';
import EvidenceVault from './pages/EvidenceVault';
import ProfileDashboard from './pages/ProfileDashboard';

function App() {
  const setUser = useAppStore(state => state.setUser);
  
  // Hydrate global state on mount
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
        <Route path="/invite" element={<GuardianInviteLanding />} />
        
        {/* Protected User Routes */}
        <Route path="/user" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="home" element={<UserHome />} />
          <Route path="journey/:id" element={<UserHome />} />
          <Route path="emergency" element={<EmergencyScreen />} />
          <Route path="ai" element={<AIChat />} />
          <Route path="invite-guardian" element={<InviteGuardian />} />
          <Route path="learn" element={<LearningHub />} />
          <Route path="learn/:lessonId" element={<LessonView />} />
          <Route path="evidence" element={<EvidenceList />} />
          <Route path="evidence/:incidentId" element={<EvidenceVault />} />
          <Route path="profile" element={<ProfileDashboard />} />
        </Route>
        
        {/* Protected Guardian Routes */}
        <Route path="/guardian" element={<ProtectedRoute requireGuardian={true}><Layout /></ProtectedRoute>}>
          <Route path="dashboard" element={<GuardianDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
