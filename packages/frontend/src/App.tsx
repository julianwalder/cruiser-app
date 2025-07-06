import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { useAuth } from '@store/auth';
import { Layout } from '@components/Layout';
import { LoadingSpinner } from '@components/LoadingSpinner';

// Pages
import { LandingPage } from '@pages/LandingPage';
import { LoginPage } from '@pages/LoginPage';
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

// Admin Route Component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  // Temporary: Skip auth check for testing
  console.log('AdminRoute: Auth state - user:', user, 'loading:', loading);
  
  // If loading for more than 3 seconds, assume auth failed and allow access for testing
  const [authTimeout, setAuthTimeout] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log('Auth loading timeout - allowing admin access for testing');
        setAuthTimeout(true);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [loading]);

  // Temporary: Allow access if no user but not loading, or if auth times out
  if (!loading && !user && !authTimeout) {
    console.log('No user found, but allowing admin access for testing');
    return <>{children}</>;
  }

  if (loading && !authTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Skip role check for testing
  // if (user && user.role !== 'super_admin' && user.role !== 'base_manager') {
  //   return <Navigate to="/dashboard" replace />;
  // }

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
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UnifiedDashboard userRole="user" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <UnifiedDashboard userRole="super_admin" />
            </AdminRoute>
          }
        />
        
        {/* Test route */}
        <Route
          path="/test"
          element={
            <div className="min-h-screen bg-green-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-green-900 mb-4">Test Route Working!</h1>
                <p className="text-xl text-green-700">React Router is functioning correctly.</p>
              </div>
            </div>
          }
        />

        {/* 404 route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App; 