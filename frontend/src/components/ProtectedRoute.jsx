import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/auth';

export default function ProtectedRoute({ children, requireGuardian = false }) {
  const token = authService.getToken();
  const user = authService.getCurrentUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireGuardian && user.role !== 'guardian') {
    return <Navigate to="/user/home" replace />;
  }

  return <>{children}</>;
}
