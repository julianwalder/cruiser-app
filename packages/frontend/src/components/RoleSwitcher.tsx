import React, { useState } from 'react';
import { Crown, Users, Building2, Plane, User, Settings, Eye, EyeOff, BookOpen } from 'lucide-react';
import { RoleTestingGuide } from './RoleTestingGuide';

export type UserRole = 'user' | 'admin' | 'super_admin' | 'base_manager' | 'instructor';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

const roleConfig = {
  user: {
    label: 'User',
    description: 'Basic pilot access',
    icon: User,
    color: 'bg-blue-100 text-blue-800',
    permissions: ['flights:read', 'flights:write', 'flightlog:read', 'flightlog:write', 'profile:read', 'bases:view']
  },
  instructor: {
    label: 'Instructor',
    description: 'Flight instructor access',
    icon: Plane,
    color: 'bg-green-100 text-green-800',
    permissions: ['flights:read', 'flights:write', 'users:read', 'profile:read', 'bases:view']
  },
  base_manager: {
    label: 'Base Manager',
    description: 'Base operations management',
    icon: Building2,
    color: 'bg-purple-100 text-purple-800',
    permissions: ['users:read', 'bases:read', 'bases:write', 'fleet:read', 'fleet:write', 'services:read', 'flights:read', 'flights:write']
  },
  admin: {
    label: 'Admin',
    description: 'System administration',
    icon: Users,
    color: 'bg-orange-100 text-orange-800',
    permissions: ['users:read', 'users:write', 'bases:read', 'bases:write', 'fleet:read', 'fleet:write', 'services:read', 'services:write', 'flights:read', 'flights:write', 'reports:read']
  },
  super_admin: {
    label: 'Super Admin',
    description: 'Full system control',
    icon: Crown,
    color: 'bg-red-100 text-red-800',
    permissions: ['*'] // All permissions
  }
};

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentRole,
  onRoleChange,
  isVisible = true,
  onToggleVisibility
}) => {
  const [showPermissions, setShowPermissions] = useState(false);
  const [showTestingGuide, setShowTestingGuide] = useState(false);

  if (!isVisible) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={onToggleVisibility}
          className="p-2 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          title="Show Role Switcher"
        >
          <Eye size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Crown size={20} className="text-gray-600" />
            <h3 className="font-semibold text-gray-900">Role Testing</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTestingGuide(true)}
              className="p-1 text-gray-500 hover:text-gray-700"
              title="Open Testing Guide"
            >
              <BookOpen size={16} />
            </button>
            <button
              onClick={() => setShowPermissions(!showPermissions)}
              className="p-1 text-gray-500 hover:text-gray-700"
              title={showPermissions ? 'Hide Permissions' : 'Show Permissions'}
            >
              {showPermissions ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button
              onClick={onToggleVisibility}
              className="p-1 text-gray-500 hover:text-gray-700"
              title="Hide Role Switcher"
            >
              <EyeOff size={16} />
            </button>
          </div>
        </div>

        {/* Role Selection */}
        <div className="p-4 space-y-2">
          <p className="text-sm font-medium text-gray-700 mb-3">Switch Role:</p>
          {Object.entries(roleConfig).map(([role, config]) => {
            const Icon = config.icon;
            const isActive = currentRole === role;
            
            return (
              <button
                key={role}
                onClick={() => onRoleChange(role as UserRole)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                  isActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-full ${config.color}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                    {config.label}
                  </p>
                  <p className={`text-sm ${isActive ? 'text-blue-700' : 'text-gray-600'}`}>
                    {config.description}
                  </p>
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Permissions Display */}
        {showPermissions && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-2">Current Permissions:</p>
            <div className="space-y-1">
              {roleConfig[currentRole].permissions.map((permission, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 font-mono">{permission}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="p-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Actions:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                localStorage.setItem('test_role', currentRole);
                window.location.reload();
              }}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Save & Reload
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('test_role');
                window.location.reload();
              }}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      
      {/* Role Testing Guide */}
      <RoleTestingGuide
        currentRole={currentRole}
        isVisible={showTestingGuide}
        onToggleVisibility={() => setShowTestingGuide(false)}
      />
    </div>
  );
}; 