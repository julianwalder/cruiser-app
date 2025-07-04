import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { User, Edit, Save, Upload, CheckCircle, AlertCircle, Plane, FileText, Shield } from 'lucide-react';
import { VeriffVerification } from '../components/VeriffVerification';
import { useAuth } from '@store/auth';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  medicalCertificate: File | null;
  idDocument: File | null;
  pilotLicense: string;
  flightHours: string;
  preferredAircraft: string;
  isProfileComplete: boolean;
  veriffVerification: {
    isVerified: boolean;
    sessionId?: string;
    verificationData?: any;
  };
}

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVeriffVerifying, setIsVeriffVerifying] = useState(false);
  
  // Profile data - will be fetched from API
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: user?.email || '', // Pre-fill email from authenticated user
    phone: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    medicalCertificate: null,
    idDocument: null,
    pilotLicense: '',
    flightHours: '',
    preferredAircraft: '',
    isProfileComplete: false,
    veriffVerification: {
      isVerified: false
    }
  });

  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Debug: Log user object and update email when user changes
  useEffect(() => {
    console.log('ProfilePage - User object:', user);
    console.log('ProfilePage - User ID:', user?.id);
    
    // Update email if user object changes and has email
    if (user?.email && !profileData.email) {
      setProfileData(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, [user, profileData.email]);

  // Fetch user profile data from API
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Check if user needs onboarding (profile incomplete)
  useEffect(() => {
    const isIncomplete = !profileData.firstName || !profileData.email || !profileData.phone;
    if (isIncomplete && !loading) {
      setIsOnboarding(true);
    }
  }, [profileData, loading]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        
        // Populate profile data with user data
        setProfileData(prev => ({
          ...prev,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || prev.email || '', // Keep pre-filled email if no API data
          phone: userData.phoneNumber || '',
          dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
          address: userData.address || '',
          pilotLicense: userData.role || '',
          flightHours: userData.totalFlightHours?.toString() || '',
          isProfileComplete: !!(userData.firstName && userData.email && userData.phoneNumber),
          veriffVerification: {
            isVerified: userData.veriffVerified || false,
            sessionId: userData.veriffData?.sessionId,
            verificationData: userData.veriffData
          }
        }));

        // If Veriff data exists, populate additional fields
        if (userData.veriffData) {
          const veriffData = typeof userData.veriffData === 'string' 
            ? JSON.parse(userData.veriffData) 
            : userData.veriffData;
          
          if (veriffData.address) {
            setProfileData(prev => ({
              ...prev,
              address: `${veriffData.address.street || ''}, ${veriffData.address.city || ''}, ${veriffData.address.country || ''}`.trim()
            }));
          }
        }
      } else {
        console.error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setProfileData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleVeriffVerificationComplete = (verificationData: any) => {
    // Update verification status
    setProfileData(prev => ({
      ...prev,
      veriffVerification: {
        isVerified: true,
        sessionId: verificationData.sessionId,
        verificationData: verificationData
      }
    }));

    // Populate personal information fields with Veriff data if available
    if (verificationData.person) {
      setProfileData(prev => ({
        ...prev,
        firstName: verificationData.person.firstName || prev.firstName,
        lastName: verificationData.person.lastName || prev.lastName,
        dateOfBirth: verificationData.person.dateOfBirth || prev.dateOfBirth,
        // Populate address if available
        address: verificationData.person.address ? 
          `${verificationData.person.address.street || ''}, ${verificationData.person.address.city || ''}, ${verificationData.person.address.country || ''}`.trim() : 
          prev.address
      }));
    }

    setIsVeriffVerifying(false);
    
    // Auto-advance to next step after successful verification
    setTimeout(() => {
      nextStep();
    }, 1000);
  };

  const handleVeriffVerificationError = (error: string) => {
    setIsVeriffVerifying(false);
    console.error('Veriff verification error:', error);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(false);
      setProfileData(prev => ({ ...prev, isProfileComplete: true }));
      setIsOnboarding(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    { id: 1, name: 'ID Verification', status: 'current' },
    { id: 2, name: 'Personal Information', status: 'upcoming' },
    { id: 3, name: 'Aviation Details', status: 'upcoming' },
    { id: 4, name: 'Review & Save', status: 'upcoming' },
  ];

  const renderOnboardingStep = () => {
    switch (currentStep) {
      case 1:
        // Check if user is properly authenticated
        if (!user || !user.id) {
          return (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
              <p className="text-gray-600 mb-4">
                You need to be properly authenticated to proceed with ID verification.
              </p>
              <p className="text-sm text-gray-500">
                User ID: {user?.id || 'Not available'}
              </p>
              <p className="text-sm text-gray-500">
                Loading: {loading ? 'Yes' : 'No'}
              </p>
            </div>
          );
        }
        
        console.log('ProfilePage - Rendering VeriffVerification with userId:', user?.id);
        console.log('ProfilePage - User object:', user);
        console.log('ProfilePage - User loading state:', loading);
        
        if (!user?.id) {
          return (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading user information...</p>
            </div>
          );
        }
        
        return (
          <VeriffVerification
            onVerificationComplete={handleVeriffVerificationComplete}
            onVerificationError={handleVeriffVerificationError}
            isVerifying={isVeriffVerifying}
            userId={user.id}
          />
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
              <p className="mt-1 text-sm text-gray-500">Let's start with your basic information.</p>
              {profileData.veriffVerification.isVerified && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-700">
                      Some fields have been pre-filled from your ID verification
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
                {profileData.veriffVerification.isVerified && profileData.firstName && (
                  <p className="mt-1 text-xs text-green-600">✓ Pre-filled from ID verification</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
                {profileData.veriffVerification.isVerified && profileData.lastName && (
                  <p className="mt-1 text-xs text-green-600">✓ Pre-filled from ID verification</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                  required
                  readOnly={!!user?.email}
                  title={user?.email ? "Email cannot be changed as it's linked to your account" : ""}
                />
                {user?.email && profileData.email === user.email && (
                  <p className="mt-1 text-xs text-green-600">✓ Pre-filled from login data</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  id="dateOfBirth"
                  value={profileData.dateOfBirth}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {profileData.veriffVerification.isVerified && profileData.dateOfBirth && (
                  <p className="mt-1 text-xs text-green-600">✓ Pre-filled from ID verification</p>
                )}
              </div>

              <div>
                <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  id="emergencyContact"
                  value={profileData.emergencyContact}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                name="address"
                id="address"
                value={profileData.address}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {profileData.veriffVerification.isVerified && profileData.address && (
                <p className="mt-1 text-xs text-green-600">✓ Pre-filled from ID verification</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Aviation Details</h3>
              <p className="mt-1 text-sm text-gray-500">Tell us about your aviation experience.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="pilotLicense" className="block text-sm font-medium text-gray-700">
                  Pilot License Type
                </label>
                <select
                  name="pilotLicense"
                  id="pilotLicense"
                  value={profileData.pilotLicense}
                  onChange={handleSelectChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select license type</option>
                  <option value="student">Student Pilot</option>
                  <option value="private">Private Pilot</option>
                  <option value="commercial">Commercial Pilot</option>
                  <option value="atp">Airline Transport Pilot</option>
                  <option value="none">No license yet</option>
                </select>
              </div>

              <div>
                <label htmlFor="flightHours" className="block text-sm font-medium text-gray-700">
                  Total Flight Hours
                </label>
                <input
                  type="number"
                  name="flightHours"
                  id="flightHours"
                  value={profileData.flightHours}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="preferredAircraft" className="block text-sm font-medium text-gray-700">
                  Preferred Aircraft Type
                </label>
                <select
                  name="preferredAircraft"
                  id="preferredAircraft"
                  value={profileData.preferredAircraft}
                  onChange={handleSelectChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select preferred aircraft</option>
                  <option value="cessna-172">Cessna 172</option>
                  <option value="piper-pa28">Piper PA-28</option>
                  <option value="diamond-da40">Diamond DA40</option>
                  <option value="cirrus-sr20">Cirrus SR20</option>
                  <option value="no-preference">No preference</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Review & Save</h3>
              <p className="mt-1 text-sm text-gray-500">Please review your information before saving.</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profileData.firstName} {profileData.lastName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profileData.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profileData.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profileData.dateOfBirth || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">License Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profileData.pilotLicense || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Flight Hours</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profileData.flightHours || '0'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Preferred Aircraft</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profileData.preferredAircraft || 'No preference'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">ID Verification</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {profileData.veriffVerification.isVerified ? '✓ Verified via Veriff' : '✗ Not verified'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Medical Certificate</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {profileData.medicalCertificate ? '✓ Uploaded' : 'Optional'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderProfileView = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-gray-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {profileData.firstName && profileData.lastName 
                ? `${profileData.firstName} ${profileData.lastName}` 
                : 'Complete Your Profile'
              }
            </h2>
            <p className="text-sm text-gray-500">{profileData.email || 'Email not provided'}</p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800 flex items-center space-x-2"
        >
          <Edit className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Profile Status */}
      {!profileData.isProfileComplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Profile Incomplete</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Please complete your profile to access all features.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Personal Information
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Full Name</dt>
              <dd className="text-sm text-gray-900">
                {profileData.firstName && profileData.lastName 
                  ? `${profileData.firstName} ${profileData.lastName}` 
                  : 'Not provided'
                }
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="text-sm text-gray-900">{profileData.email || 'Not provided'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="text-sm text-gray-900">{profileData.phone || 'Not provided'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
              <dd className="text-sm text-gray-900">{profileData.dateOfBirth || 'Not provided'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="text-sm text-gray-900">{profileData.address || 'Not provided'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Emergency Contact</dt>
              <dd className="text-sm text-gray-900">{profileData.emergencyContact || 'Not provided'}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Plane className="w-5 h-5 mr-2" />
            Aviation Information
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Pilot License</dt>
              <dd className="text-sm text-gray-900">{profileData.pilotLicense || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Flight Hours</dt>
              <dd className="text-sm text-gray-900">{profileData.flightHours || '0'} hours</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Preferred Aircraft</dt>
              <dd className="text-sm text-gray-900">{profileData.preferredAircraft || 'No preference'}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">ID Verification</h4>
                <p className="text-sm text-gray-500">Verified via Veriff</p>
              </div>
              {profileData.veriffVerification.isVerified ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
            </div>
            {!profileData.veriffVerification.isVerified && (
              <button
                onClick={() => setIsVeriffVerifying(true)}
                className="mt-3 w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <Shield className="w-4 h-4" />
                <span>Start Verification</span>
              </button>
            )}
          </div>
          <div className="border border-gray-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Medical Certificate</h4>
                <p className="text-sm text-gray-500">Aviation medical certificate</p>
              </div>
              {profileData.medicalCertificate ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEditForm = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800 disabled:opacity-50 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="editFirstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              id="editFirstName"
              value={profileData.firstName}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="editLastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              id="editLastName"
              value={profileData.lastName}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="editEmail" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="editEmail"
              value={profileData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="editPhone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              id="editPhone"
              value={profileData.phone}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="editDateOfBirth" className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              id="editDateOfBirth"
              value={profileData.dateOfBirth}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="editEmergencyContact" className="block text-sm font-medium text-gray-700">
              Emergency Contact
            </label>
            <input
              type="text"
              name="emergencyContact"
              id="editEmergencyContact"
              value={profileData.emergencyContact}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="editAddress" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              name="address"
              id="editAddress"
              value={profileData.address}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="editPilotLicense" className="block text-sm font-medium text-gray-700">
              Pilot License Type
            </label>
            <select
              name="pilotLicense"
              id="editPilotLicense"
              value={profileData.pilotLicense}
              onChange={handleSelectChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select license type</option>
              <option value="student">Student Pilot</option>
              <option value="private">Private Pilot</option>
              <option value="commercial">Commercial Pilot</option>
              <option value="atp">Airline Transport Pilot</option>
              <option value="none">No license yet</option>
            </select>
          </div>

          <div>
            <label htmlFor="editFlightHours" className="block text-sm font-medium text-gray-700">
              Total Flight Hours
            </label>
            <input
              type="number"
              name="flightHours"
              id="editFlightHours"
              value={profileData.flightHours}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="0"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Profile - Cruiser Aviation Platform</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading profile...</p>
              </div>
            </div>
          </div>
        ) : isOnboarding ? (
          <div className="bg-white shadow rounded-lg">
            {/* Onboarding Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Complete Your Profile</h2>
              <p className="text-sm text-gray-500 mt-1">Step {currentStep} of 4</p>
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-4 bg-gray-50">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Step Content */}
            <div className="p-6">
              {renderOnboardingStep()}
            </div>

            {/* Navigation */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={nextStep}
                disabled={currentStep === 4}
                className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStep === 4 ? 'Complete Profile' : 'Next'}
              </button>
            </div>
          </div>
        ) : isEditing ? (
          renderEditForm()
        ) : (
          renderProfileView()
        )}
      </div>

      {/* Veriff Verification Modal */}
      {isVeriffVerifying && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">ID Verification</h3>
              <button
                onClick={() => setIsVeriffVerifying(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <VeriffVerification
                onVerificationComplete={handleVeriffVerificationComplete}
                onVerificationError={handleVeriffVerificationError}
                isVerifying={isVeriffVerifying}
                userId={user?.id || ''}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 