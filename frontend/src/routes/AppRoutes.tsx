import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import * as Pages from '../pages/Placeholders';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Pages.Landing />} />
        <Route path="/login" element={<Pages.Login />} />
        <Route path="/register" element={<Pages.Register />} />
        <Route path="/forgot-password" element={<Pages.ForgotPassword />} />
        <Route path="/reset-password" element={<Pages.ResetPassword />} />
        
        {/* Protected Routes */}
        <Route path="/education" element={<ProtectedRoute><Pages.Education /></ProtectedRoute>} />
        <Route path="/onboarding/profile" element={<ProtectedRoute><Pages.ProfileOnboarding /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Pages.ProfileManagement /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Pages.Dashboard /></ProtectedRoute>} />
        <Route path="/assessment" element={<ProtectedRoute><Pages.Assessment /></ProtectedRoute>} />
        <Route path="/assessment/history" element={<ProtectedRoute><Pages.AssessmentHistory /></ProtectedRoute>} />
        <Route path="/assessment/result/:resultId" element={<ProtectedRoute><Pages.AssessmentResultDetail /></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute><Pages.Recommendations /></ProtectedRoute>} />
        <Route path="/roadmap" element={<ProtectedRoute><Pages.Roadmap /></ProtectedRoute>} />
        <Route path="/learning" element={<ProtectedRoute><Pages.Learning /></ProtectedRoute>} />
        <Route path="/resume" element={<ProtectedRoute><Pages.Resume /></ProtectedRoute>} />
        <Route path="/internships" element={<ProtectedRoute><Pages.Internships /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><Pages.Jobs /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Pages.Settings /></ProtectedRoute>} />
        
        {/* Fallback route */}
        <Route path="*" element={<Pages.Landing />} />
      </Routes>
    </Router>
  );
};
