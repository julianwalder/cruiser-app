import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AppLayout } from '@components/AppLayout';
import { 
  BarChart3, 
  Plane, 
  PlaneTakeoff, 
  User, 
  Settings, 
  Calendar,
  FileText,
  CreditCard,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Dashboard Overview Component
const DashboardOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Flight Hours
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    127.5
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Remaining Credits
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    8.5 hours
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Next Flight
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    Tomorrow 10:00 AM
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    This Month
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    12.5 hours
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Flights</h3>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Plane className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    Training Flight - Cessna 172
                  </div>
                  <div className="text-sm text-gray-500">
                    Instructor: John Smith
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  2.5 hours
                </div>
                <div className="text-sm text-gray-500">
                  Dec 15, 2024
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <PlaneTakeoff className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    Solo Flight - Piper PA-28
                  </div>
                  <div className="text-sm text-gray-500">
                    Solo flight
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  1.8 hours
                </div>
                <div className="text-sm text-gray-500">
                  Dec 12, 2024
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100">
              <Plane className="w-4 h-4 mr-3" />
              Schedule New Flight
            </button>
            <button className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100">
              <FileText className="w-4 h-4 mr-3" />
              View Invoices
            </button>
            <button className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100">
              <User className="w-4 h-4 mr-3" />
              Update Profile
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-blue-50 rounded-md">
              <AlertCircle className="w-4 h-4 text-blue-600 mr-3" />
              <div className="text-sm text-blue-800">
                Your next flight is scheduled for tomorrow at 10:00 AM
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 rounded-md">
              <Clock className="w-4 h-4 text-green-600 mr-3" />
              <div className="text-sm text-green-800">
                You have 8.5 hours of flight credits remaining
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// My Flights Component
const MyFlights: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">My Flights</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600">Flight management interface coming soon...</p>
        </div>
      </div>
    </div>
  );
};

// Flight Log Component
const FlightLog: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Flight Log</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600">Flight logging interface coming soon...</p>
        </div>
      </div>
    </div>
  );
};

// Services Component
const Services: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Available Services</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600">Services catalog coming soon...</p>
        </div>
      </div>
    </div>
  );
};

// Invoices Component
const Invoices: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Invoices</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600">Invoice management coming soon...</p>
        </div>
      </div>
    </div>
  );
};

// Payments Component
const Payments: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Payments</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600">Payment management coming soon...</p>
        </div>
      </div>
    </div>
  );
};

// Bases Component
const Bases: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Bases</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600">Base information coming soon...</p>
        </div>
      </div>
    </div>
  );
};

// Profile Component
const Profile: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Profile</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600">Profile management coming soon...</p>
        </div>
      </div>
    </div>
  );
};

// Settings Component
const SettingsSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Settings</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600">Settings management coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export const UserDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'flights':
        return <MyFlights />;
      case 'flightlog':
        return <FlightLog />;
      case 'services':
        return <Services />;
      case 'invoices':
        return <Invoices />;
      case 'payments':
        return <Payments />;
      case 'bases':
        return <Bases />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <AppLayout activeSection={activeSection} onSectionChange={setActiveSection} userType="user">
      {renderSection()}
    </AppLayout>
  );
};
