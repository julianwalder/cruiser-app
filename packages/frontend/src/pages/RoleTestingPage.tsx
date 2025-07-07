import React from 'react';
import { RoleSwitcher } from '@components/RoleSwitcher';
import { useRoleTesting } from '@hooks/useRoleTesting';
import { CheckCircle, XCircle, Shield, Users, Building2, Plane, Crown, Settings } from 'lucide-react';

export const RoleTestingPage: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    isRoleSwitcherVisible,
    toggleRoleSwitcher,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  } = useRoleTesting();

  const testPermissions = [
    'users:read',
    'users:write',
    'users:delete',
    'bases:read',
    'bases:write',
    'bases:delete',
    'fleet:read',
    'fleet:write',
    'fleet:delete',
    'services:read',
    'services:write',
    'services:delete',
    'roles:read',
    'roles:write',
    'roles:delete',
    'reports:read',
    'reports:write'
  ];

  const roleIcons = {
    user: Users,
    instructor: Plane,
    base_manager: Building2,
    admin: Shield,
    super_admin: Crown
  };

  const RoleIcon = roleIcons[currentRole] || Users;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Role Switcher */}
      <RoleSwitcher
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        isVisible={isRoleSwitcherVisible}
        onToggleVisibility={toggleRoleSwitcher}
      />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <RoleIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Role Testing Dashboard</h1>
                <p className="text-sm text-gray-600">Test different user roles and permissions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Current Role: {currentRole.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Role Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Current Role Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <RoleIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{currentRole.replace('_', ' ').toUpperCase()}</p>
                    <p className="text-sm text-gray-600">
                      {currentRole === 'user' && 'Basic pilot access'}
                      {currentRole === 'instructor' && 'Flight instructor access'}
                      {currentRole === 'base_manager' && 'Base operations management'}
                      {currentRole === 'admin' && 'System administration'}
                      {currentRole === 'super_admin' && 'Full system control'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Permission Tests</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Can manage users?</span>
                      {hasPermission('users:write') ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Can manage bases?</span>
                      {hasPermission('bases:write') ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Can manage roles?</span>
                      {hasPermission('roles:write') ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Can view reports?</span>
                      {hasPermission('reports:read') ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Permission Matrix */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Permission Matrix</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Detailed view of all permissions for the current role
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permission
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Access
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {testPermissions.map((permission) => (
                      <tr key={permission}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {permission}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {hasPermission(permission) ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Allowed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <XCircle className="w-3 h-3 mr-1" />
                              Denied
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {permission.includes('users') && 'User management operations'}
                          {permission.includes('bases') && 'Base management operations'}
                          {permission.includes('fleet') && 'Aircraft fleet operations'}
                          {permission.includes('services') && 'Service management operations'}
                          {permission.includes('roles') && 'Role and permission management'}
                          {permission.includes('reports') && 'Reporting and analytics access'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Testing Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">How to Test Roles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">1. Switch Roles</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use the role switcher in the top-right corner</li>
                <li>• Click on any role to switch instantly</li>
                <li>• Watch the permission matrix update in real-time</li>
                <li>• Use "Save & Reload" to persist the role</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">2. Test Features</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Navigate to different sections in the main app</li>
                <li>• Try to access admin features with different roles</li>
                <li>• Verify that UI elements show/hide correctly</li>
                <li>• Check that API calls respect role permissions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => window.open('/dashboard', '_blank')}
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Open Main Dashboard</h3>
                <p className="text-sm text-gray-600">Test the full application</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setCurrentRole('super_admin')}
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Switch to Super Admin</h3>
                <p className="text-sm text-gray-600">Test full system access</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setCurrentRole('user')}
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Switch to User</h3>
                <p className="text-sm text-gray-600">Test basic access</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}; 