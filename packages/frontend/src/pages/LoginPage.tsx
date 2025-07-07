import React, { useEffect } from 'react';
import { useAuth } from '../store/auth';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleCloudflareLogin = () => {
    // Cloudflare Access handles authentication automatically
    // This will redirect to Cloudflare Access login if not authenticated
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Loading...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Login - Cruiser Aviation Platform</title>
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Access your Cruiser Aviation dashboard
            </p>
          </div>
          
          <div className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  This application uses Cloudflare Access for secure authentication.
                </p>
                <button
                  onClick={handleCloudflareLogin}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Continue with Cloudflare Access
                </button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                By continuing, you agree to our terms of service and privacy policy.
              </p>
            </div>
          </div>

          {/* Role Information */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Available Roles
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li><strong>User:</strong> Basic access to flight information</li>
              <li><strong>Instructor:</strong> Manage students and lessons</li>
              <li><strong>Base Manager:</strong> Manage bases and operations</li>
              <li><strong>Admin:</strong> Full system administration</li>
              <li><strong>Super Admin:</strong> Complete system control</li>
            </ul>
          </div>

          <div className="text-center">
            <a
              href="/"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </>
  );
} 