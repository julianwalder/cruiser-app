import React, { useState } from 'react';
import { AppLayout } from '@components/AppLayout';
import UserManagement from './admin/UserManagement';
import BaseManagement from './admin/BaseManagement';
import FleetManagement from './admin/FleetManagement';
import RoleManagement from './admin/RoleManagement';
import ServiceManagement from './admin/ServiceManagement';

// User-specific components
import { FlightLogPage } from './FlightLogPage';
import { ProfilePage } from './ProfilePage';

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
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
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
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
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
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
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
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
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
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
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
        </div>
      </div>
    </div>
  );
};

// Admin Dashboard Overview
const AdminDashboardOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Users
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    1,234
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
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Flights
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    23
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
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Bases
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    8
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
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Revenue This Month
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    €45,678
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">System Overview</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Activity</h4>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-gray-600">New user registration</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-gray-600">Flight scheduled</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                  <span className="text-gray-600">Maintenance alert</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Add New User
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Schedule Flight
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  View Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface UnifiedDashboardProps {
  userRole?: 'user' | 'admin' | 'super_admin' | 'base_manager';
}

export const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({ 
  userRole = 'user' 
}) => {
  const [activeSection, setActiveSection] = useState('dashboard');

  // Define accessible sections based on user role
  const getAccessibleSections = () => {
    const baseSections = ['dashboard'];
    
    switch (userRole) {
      case 'super_admin':
        return [
          ...baseSections,
          'users',
          'roles', 
          'bases',
          'fleet',
          'services',
          'flights',
          'reports',
          'settings'
        ];
      case 'admin':
        return [
          ...baseSections,
          'users',
          'bases',
          'fleet',
          'services',
          'flights',
          'reports',
          'settings'
        ];
      case 'base_manager':
        return [
          ...baseSections,
          'users',
          'bases',
          'fleet',
          'services',
          'flights',
          'settings'
        ];
      case 'user':
      default:
        return [
          ...baseSections,
          'flights',
          'flightlog',
          'services',
          'invoices',
          'payments',
          'bases',
          'fleet',
          'profile',
          'settings'
        ];
    }
  };

  const accessibleSections = getAccessibleSections();

  const renderSection = () => {
    // Check if user has access to this section
    if (!accessibleSections.includes(activeSection)) {
      return (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this section.</p>
        </div>
      );
    }

    switch (activeSection) {
      case 'dashboard':
        return userRole === 'user' ? <DashboardOverview /> : <AdminDashboardOverview />;
      
      // Admin sections
      case 'users':
        return <UserManagement />;
      case 'bases':
        return <BaseManagement userRole={userRole} />;
      case 'fleet':
        return <FleetManagement userRole={userRole} />;
      case 'roles':
        return <RoleManagement />;
      case 'services':
        return <ServiceManagement userRole={userRole} />;
      case 'flights':
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Flight Management</h2>
            <p className="text-gray-600">Flight management interface coming soon...</p>
          </div>
        );
      case 'reports':
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reports & Analytics</h2>
            <p className="text-gray-600">Reports and analytics section coming soon...</p>
          </div>
        );
      
      // User sections
      case 'flightlog':
        return <FlightLogPage />;
      case 'profile':
        return <ProfilePage />;
      case 'invoices':
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Invoices</h2>
            <p className="text-gray-600">Invoice management coming soon...</p>
          </div>
        );
      case 'payments':
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payments</h2>
            <p className="text-gray-600">Payment management coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">Settings management coming soon...</p>
          </div>
        );
      default:
        return userRole === 'user' ? <DashboardOverview /> : <AdminDashboardOverview />;
    }
  };

  return (
    <AppLayout 
      activeSection={activeSection} 
      onSectionChange={setActiveSection}
      userType={userRole === 'user' ? 'user' : 'admin'}
      title={`${userRole === 'user' ? 'User' : 'Admin'} Dashboard - Cruiser Aviation Platform`}
    >
      {renderSection()}
    </AppLayout>
  );
};
 