import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components/ui/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isOnboarded, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading fullScreen={true} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const isOnboardingPath = ['/education', '/onboarding/profile', '/profile'].includes(location.pathname);

  // Redirect to onboarding step if profile setup is not yet complete
  if (!isOnboarded && !isOnboardingPath) {
    return <Navigate to="/education" replace />;
  }

  return <>{children}</>;
};
