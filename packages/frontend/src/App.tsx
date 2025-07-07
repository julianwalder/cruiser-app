import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { useAuth } from '@store/auth';
import { LoadingSpinner } from '@components/LoadingSpinner';

// Pages
import LoginPage from '@pages/LoginPage';
import { UnifiedDashboard } from '@pages/UnifiedDashboard';
import { NotFoundPage } from '@pages/NotFoundPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  // Temporary: Skip auth check for testing
  console.log('ProtectedRoute: Auth state - user:', user, 'loading:', loading);
  
  // If loading for more than 3 seconds, assume auth failed and allow access for testing
  const [authTimeout, setAuthTimeout] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log('Auth loading timeout - allowing dashboard access for testing');
        setAuthTimeout(true);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [loading]);

  // Temporary: Allow access if no user but not loading, or if auth times out
  if (!loading && !user && !authTimeout) {
    console.log('No user found, but allowing dashboard access for testing');
    return <>{children}</>;
  }

  if (loading && !authTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
};



function App() {
  return (
    <>
      <Helmet>
        <title>Cruiser Aviation Platform</title>
        <meta name="description" content="Modern flight school and aircraft rental management system" />
      </Helmet>

      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes - all authenticated users use UnifiedDashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <UnifiedDashboard />
          </ProtectedRoute>
        } />
        
        {/* Redirect /admin to /dashboard (same unified interface) */}
        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
        
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App; 