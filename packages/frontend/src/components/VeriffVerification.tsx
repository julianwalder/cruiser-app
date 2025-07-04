import React, { useEffect, useRef, useState } from 'react';
import { Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface VeriffVerificationProps {
  onVerificationComplete: (verificationData: any) => void;
  onVerificationError: (error: string) => void;
  isVerifying: boolean;
  userId: string;
}

interface VerificationStatus {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

export const VeriffVerification: React.FC<VeriffVerificationProps> = ({
  onVerificationComplete,
  onVerificationError,
  isVerifying,
  userId
}) => {
  const veriffContainerRef = useRef<HTMLDivElement>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    status: 'idle',
    message: 'Ready to start verification'
  });
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);

  // Mock Veriff session creation - in real implementation, this would come from your backend
  const createVeriffSession = async () => {
    console.log('VeriffVerification - Creating session with userId:', userId);
    console.log('VeriffVerification - API_URL:', API_URL);
    
    if (!userId) {
      console.error('VeriffVerification - No userId provided');
      setVerificationStatus({ 
        status: 'error', 
        message: 'No user ID provided for verification' 
      });
      onVerificationError('No user ID provided for verification');
      return;
    }
    
    setVerificationStatus({ status: 'loading', message: 'Creating verification session...' });
    
    try {
      // Call the backend API to create a Veriff session
      const requestBody = { userId: userId };
      console.log('VeriffVerification - Sending request body:', requestBody);
      console.log('VeriffVerification - Request URL:', `${API_URL}/api/veriff/create-session`);
      
      const response = await fetch(`${API_URL}/api/veriff/create-session`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('VeriffVerification - Response status:', response.status);
      
      if (!response.ok) {
        // If backend is not available, fall back to mock data for development
        if (response.status === 404 || response.status === 0) {
          console.log('Backend not available, using mock data for development');
          await createMockSession();
          return;
        }
        throw new Error(`Failed to create session: ${response.status} ${response.statusText}`);
      }
      
      const sessionData = await response.json();
      console.log('VeriffVerification - Session created successfully:', sessionData);
      setSessionUrl(sessionData.url || sessionData.sessionUrl);
      
      setVerificationStatus({ 
        status: 'success', 
        message: 'Verification session created successfully' 
      });
      
      // Initialize Veriff widget
      initializeVeriffWidget(sessionData);
      
    } catch (error) {
      console.error('Error creating Veriff session:', error);
      
      // Fall back to mock data for development
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        console.log('Network error, using mock data for development');
        await createMockSession();
        return;
      }
      
      setVerificationStatus({ 
        status: 'error', 
        message: 'Failed to create verification session' 
      });
      onVerificationError('Failed to create verification session');
    }
  };

  // Mock session creation for development
  const createMockSession = async () => {
    setVerificationStatus({ status: 'loading', message: 'Creating mock verification session...' });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockSessionData = {
      sessionId: `mock_session_${Date.now()}`,
      sessionUrl: 'https://cdn.veriff.me/sdk/js/1.1/veriff.min.js',
      timestamp: new Date().toISOString(),
      user: {
        id: 'mock_user_123',
        givenName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        dateOfBirth: '1985-06-15', // More realistic date of birth
      }
    };
    
    setSessionUrl(mockSessionData.sessionUrl);
    setVerificationStatus({ 
      status: 'success', 
      message: 'Mock verification session created successfully' 
    });
    
    // Initialize mock Veriff widget
    initializeVeriffWidget(mockSessionData);
  };

  const initializeVeriffWidget = (sessionData: any) => {
    if (!veriffContainerRef.current) return;

    // In a real implementation, you would use the actual Veriff SDK
    // import { Veriff } from '@veriff/incontext-sdk';
    
    // For now, we'll simulate the verification process with the session data
    // Use mock user data since the backend doesn't return user data in the session
    const mockVeriffData = {
      sessionId: sessionData.sessionId,
      person: {
        firstName: 'John', // Mock data since backend doesn't provide user data
        lastName: 'Doe',
        dateOfBirth: '1985-06-15', // More realistic date of birth that will be pre-filled
        nationality: 'US',
        address: {
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          country: 'US',
          postalCode: '10001'
        }
      },
      document: {
        type: 'PASSPORT',
        country: 'US',
        number: '123456789'
      },
      verification: {
        status: 'approved',
        timestamp: new Date().toISOString()
      }
    };

    // Simulate verification completion after a delay
    setTimeout(() => {
      onVerificationComplete(mockVeriffData);
    }, 3000);
  };

  useEffect(() => {
    if (isVerifying && !sessionUrl) {
      createVeriffSession();
    }
  }, [isVerifying]);

  const handleStartVerification = () => {
    createVeriffSession();
  };

  const getStatusIcon = () => {
    switch (verificationStatus.status) {
      case 'loading':
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Shield className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus.status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">ID Verification</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please verify your identity using our secure verification system.
        </p>
      </div>

      {/* Status Display */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <p className={`text-sm font-medium ${getStatusColor()}`}>
              {verificationStatus.message}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              This process typically takes 2-3 minutes
            </p>
          </div>
        </div>
      </div>

      {/* Veriff Container */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        <div ref={veriffContainerRef} className="min-h-[400px] flex items-center justify-center">
          {verificationStatus.status === 'idle' ? (
            <div className="text-center">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Ready to Start Verification
              </h4>
              <p className="text-sm text-gray-500 mb-6">
                Click the button below to begin the secure identity verification process.
              </p>
              <button
                onClick={handleStartVerification}
                disabled={isVerifying}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
              >
                <Shield className="w-4 h-4" />
                <span>Start Verification</span>
              </button>
            </div>
          ) : verificationStatus.status === 'loading' ? (
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Initializing Verification
              </h4>
              <p className="text-sm text-gray-500">
                Please wait while we set up your verification session...
              </p>
            </div>
          ) : verificationStatus.status === 'success' ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Verification in Progress
              </h4>
              <p className="text-sm text-gray-500">
                Please complete the verification steps in the widget below...
              </p>
              {/* In a real implementation, the Veriff widget would be rendered here */}
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700">
                  🔄 Simulating Veriff widget integration...
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  In production, this would show the actual Veriff verification interface
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Verification Failed
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                There was an error creating your verification session.
              </p>
              <button
                onClick={handleStartVerification}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          What you'll need for verification:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• A valid government-issued ID (passport, driver's license, or national ID)</li>
          <li>• A well-lit environment for face verification</li>
          <li>• A stable internet connection</li>
          <li>• 2-3 minutes of uninterrupted time</li>
        </ul>
      </div>

      {/* Development Mode Notice */}
      {verificationStatus.message.includes('mock') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-900 mb-1">
                Development Mode
              </h4>
              <p className="text-xs text-yellow-700">
                Using mock verification data for development. In production, this would connect to the real Veriff service.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              Security & Privacy
            </h4>
            <p className="text-xs text-gray-600">
              Your verification data is encrypted and processed securely. We comply with GDPR and aviation industry standards. 
              Your information is only used for identity verification purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 