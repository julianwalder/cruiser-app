import React, { useState } from 'react';
import { AppLayout } from '@components/AppLayout';
import { RoleSwitcher } from '@components/RoleSwitcher';
import { useRoleTesting } from '@hooks/useRoleTesting';
import { UnifiedDashboardOverview } from '@components/UnifiedDashboardOverview';
import UserManagement from './admin/UserManagement';
import BaseManagement from './admin/BaseManagement';
import FleetManagement from './admin/FleetManagement';
import RoleManagement from './admin/RoleManagement';
import ServiceManagement from './admin/ServiceManagement';

// User-specific components
import { FlightLogPage } from './FlightLogPage';
import { ProfilePage } from './ProfilePage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface UnifiedDashboardProps {
  userRole?: 'user' | 'admin' | 'super_admin' | 'base_manager' | 'instructor';
}

export const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({ 
  userRole = 'user' 
}) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // Use role testing hook for development/testing
  const {
    currentRole,
    setCurrentRole,
    isRoleSwitcherVisible,
    toggleRoleSwitcher,
    getAccessibleSections,
    hasPermission,
    initializeRole
  } = useRoleTesting();

  // Initialize role for production superadmin users
  React.useEffect(() => {
    initializeRole(userRole);
  }, [userRole, initializeRole]);

  // Use role testing in development, fallback to prop in production
  // For super admin in production, allow role testing but default to super_admin
  const effectiveRole = process.env.NODE_ENV === 'development' 
    ? currentRole 
    : (userRole === 'super_admin' ? currentRole : userRole);
  const accessibleSections = getAccessibleSections();

  const renderSection = () => {
    // Debug logging
    console.log('🔍 UnifiedDashboard Debug:', {
      activeSection,
      accessibleSections,
      effectiveRole,
      hasAccess: accessibleSections.includes(activeSection)
    });
    
    // Check if user has access to this section
    if (!accessibleSections.includes(activeSection)) {
      return (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this section.</p>
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">Debug Info:</p>
            <p className="text-sm text-gray-600">Active Section: {activeSection}</p>
            <p className="text-sm text-gray-600">Accessible Sections: {accessibleSections.join(', ')}</p>
            <p className="text-sm text-gray-600">Effective Role: {effectiveRole}</p>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'dashboard':
        return <UnifiedDashboardOverview userRole={effectiveRole} />;
      
      // Admin sections
      case 'users':
        return <UserManagement />;
      case 'bases':
        return <BaseManagement userRole={effectiveRole} />;
      case 'fleet':
        return <FleetManagement userRole={effectiveRole} />;
      case 'roles':
        return <RoleManagement />;
      case 'services':
        return <ServiceManagement userRole={effectiveRole} />;
      case 'flights':
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Flight Scheduling</h2>
            <p className="text-gray-600">Flight scheduling interface coming soon...</p>
          </div>
        );
      case 'flightmanagement':
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Flight Management</h2>
            <p className="text-gray-600">Comprehensive flight management interface for instructors and administrators.</p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Flight Planning</h3>
                <p className="text-gray-600 mb-4">Plan and schedule training flights</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Plan Flight
                </button>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Progress</h3>
                <p className="text-gray-600 mb-4">Track student training progress</p>
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  View Progress
                </button>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Flight Records</h3>
                <p className="text-gray-600 mb-4">Manage flight log entries</p>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                  Manage Logs
                </button>
              </div>
            </div>
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
            <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-800 font-medium">Debug Info:</p>
              <p className="text-sm text-blue-700">Section: invoices</p>
              <p className="text-sm text-blue-700">Effective Role: {effectiveRole}</p>
              <p className="text-sm text-blue-700">Accessible Sections: {accessibleSections.join(', ')}</p>
              <p className="text-sm text-blue-700">Has Access: {accessibleSections.includes('invoices') ? 'Yes' : 'No'}</p>
            </div>
          </div>
        );
      case 'payments':
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payments</h2>
            <p className="text-gray-600">Payment management coming soon...</p>
            <div className="mt-4 p-4 bg-green-50 rounded border border-green-200">
              <p className="text-sm text-green-800 font-medium">Debug Info:</p>
              <p className="text-sm text-green-700">Section: payments</p>
              <p className="text-sm text-green-700">Effective Role: {effectiveRole}</p>
              <p className="text-sm text-green-700">Accessible Sections: {accessibleSections.join(', ')}</p>
              <p className="text-sm text-green-700">Has Access: {accessibleSections.includes('payments') ? 'Yes' : 'No'}</p>
            </div>
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
        return <UnifiedDashboardOverview userRole={effectiveRole} />;
    }
  };

  return (
    <>
      {/* Role Switcher for Development/Testing or Super Admin in Production */}
      {(process.env.NODE_ENV === 'development' || effectiveRole === 'super_admin') && (
        <RoleSwitcher
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          isVisible={isRoleSwitcherVisible}
          onToggleVisibility={toggleRoleSwitcher}
        />
      )}
      
      <AppLayout 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        userType={effectiveRole}
        title={`${effectiveRole === 'user' ? 'User' : effectiveRole === 'instructor' ? 'Instructor' : effectiveRole === 'base_manager' ? 'Base Manager' : effectiveRole === 'admin' ? 'Admin' : 'Super Admin'} Dashboard - Cruiser Aviation Platform`}
      >
        {renderSection()}
      </AppLayout>
    </>
  );
};
 