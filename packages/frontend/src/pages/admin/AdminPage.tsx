import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import UserManagement from './UserManagement';
import BaseManagement from './BaseManagement';
import FleetManagement from './FleetManagement';
import RoleManagement from './RoleManagement';
import ServiceManagement from './ServiceManagement';

const AdminPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('users');

  console.log('AdminPage rendered with activeSection:', activeSection);

  const renderSection = () => {
    console.log('Rendering section:', activeSection);
    try {
      switch (activeSection) {
        case 'dashboard':
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
              <p className="text-gray-600">Welcome to the Cruiser Aviation Admin Dashboard</p>
            </div>
          );
        case 'users':
          return <UserManagement />;
        case 'bases':
          return <BaseManagement />;
        case 'fleet':
          return <FleetManagement />;
        case 'roles':
          return <RoleManagement />;
        case 'services':
          return <ServiceManagement />;
        case 'flights':
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Flights</h2>
              <p className="text-gray-600">Flight management section coming soon...</p>
            </div>
          );
        case 'reports':
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Reports</h2>
              <p className="text-gray-600">Reports and analytics section coming soon...</p>
            </div>
          );
        case 'settings':
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
              <p className="text-gray-600">System settings section coming soon...</p>
            </div>
          );
        default:
          return <UserManagement />;
      }
    } catch (error) {
      console.error('Error rendering section:', error);
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600">There was an error loading this section. Please try again.</p>
        </div>
      );
    }
  };

  return (
    <AppLayout 
      activeSection={activeSection} 
      onSectionChange={setActiveSection}
      userType="admin"
    >
      {renderSection()}
    </AppLayout>
  );
};

export default AdminPage; 