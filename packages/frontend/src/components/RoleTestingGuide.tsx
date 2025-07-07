import React, { useState } from 'react';
import { Crown, Users, Building2, Plane, User, Settings, Eye, EyeOff, CheckCircle, XCircle, Info, Edit, Save, AlertTriangle } from 'lucide-react';
import { UserRole } from './RoleSwitcher';
import { useRoleTesting } from '../hooks/useRoleTesting';
import toast from 'react-hot-toast';

interface RoleTestingGuideProps {
  currentRole: UserRole;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

interface Capability {
  feature: string;
  accessible: boolean;
  description: string;
}

interface RoleConfig {
  label: string;
  description: string;
  icon: any;
  color: string;
  capabilities: Capability[];
}

const roleIcons = {
  user: User,
  instructor: Plane,
  base_manager: Building2,
  admin: Users,
  super_admin: Crown
};

export const RoleTestingGuide: React.FC<RoleTestingGuideProps> = ({
  currentRole,
  isVisible = false,
  onToggleVisibility
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const { 
    roleCapabilities, 
    updateRoleCapabilities, 
    resetRoleCapabilities 
  } = useRoleTesting();

  if (!isVisible) {
    return null;
  }

  const currentCapabilities = roleCapabilities[selectedRole];
  const isSuperAdmin = currentRole === 'super_admin';

  const handleCapabilityToggle = (role: UserRole, featureIndex: number) => {
    if (!isEditing) return;
    
    const updatedCapabilities = {
      ...roleCapabilities,
      [role]: {
        ...roleCapabilities[role],
        capabilities: roleCapabilities[role].capabilities.map((cap, index) => 
          index === featureIndex 
            ? { ...cap, accessible: !cap.accessible }
            : cap
        )
      }
    };
    
    updateRoleCapabilities(updatedCapabilities);
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    setHasChanges(false);
    setIsEditing(false);
    toast.success('Role capabilities updated successfully!');
  };

  const handleCancelEdit = () => {
    if (hasChanges) {
      setShowConfirmModal(true);
    } else {
      setIsEditing(false);
    }
  };

  const confirmCancel = () => {
    resetRoleCapabilities();
    setHasChanges(false);
    setIsEditing(false);
    setShowConfirmModal(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <Info size={24} className="text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Role Testing Guide</h2>
              {isEditing && (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  Editing Mode
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <button
                  onClick={onToggleVisibility}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              )}
              {isSuperAdmin && !isEditing && (
                <>
                  <button
                    onClick={() => {
                      console.log('🔍 Current Role Capabilities:', roleCapabilities);
                      console.log('🔍 Instructor Capabilities:', roleCapabilities.instructor?.capabilities);
                      toast.success('Check console for debug info');
                    }}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Debug
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800"
                  >
                    Update Roles
                  </button>
                </>
              )}
              {isSuperAdmin && isEditing && (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      resetRoleCapabilities();
                      setHasChanges(false);
                      toast.success('Role capabilities reset to defaults!');
                    }}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Reset to Defaults
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={!hasChanges}
                    className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Save size={16} />
                    <span>Save Changes</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Role to Test:</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(roleCapabilities).map(([role, config]) => {
                const Icon = roleIcons[role as UserRole];
                const isActive = selectedRole === role;
                
                return (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role as UserRole)}
                    className={`p-4 rounded-lg border transition-all ${
                      isActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${config.color} w-fit mx-auto mb-2`}>
                      <Icon size={20} />
                    </div>
                    <p className={`font-medium text-sm ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                      {config.label}
                    </p>
                    <p className={`text-xs ${isActive ? 'text-blue-700' : 'text-gray-600'}`}>
                      {config.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Capabilities List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {currentCapabilities.label} Capabilities:
                </h3>
                {isEditing && (
                  <p className="text-sm text-gray-600">
                    Click on capabilities to toggle access
                  </p>
                )}
              </div>
              
              <div className="grid gap-3">
                {currentCapabilities.capabilities.map((capability, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border transition-all ${
                      capability.accessible
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    } ${isEditing ? 'cursor-pointer hover:opacity-80' : ''}`}
                    onClick={() => handleCapabilityToggle(selectedRole, index)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {capability.accessible ? (
                          <CheckCircle size={20} className="text-green-600" />
                        ) : (
                          <XCircle size={20} className="text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          capability.accessible ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {capability.feature}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          capability.accessible ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {capability.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center space-x-3 p-6 border-b border-gray-200">
              <AlertTriangle size={24} className="text-yellow-600" />
              <h3 className="text-lg font-medium text-gray-900">Discard Changes?</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                You have unsaved changes to role capabilities. Are you sure you want to discard them?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Continue Editing
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Discard Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 