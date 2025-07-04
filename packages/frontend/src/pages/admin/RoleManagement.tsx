import React, { useState } from 'react';
import { Plus, Eye, Edit, Trash2, Crown } from 'lucide-react';

const RoleManagement: React.FC = () => {
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState('super_admin'); // For demo - in real app this would come from auth context

  const [roleFormData, setRoleFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: [] as string[],
    color: 'bg-gray-100 text-gray-800'
  });

  // Mock roles data
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'super_admin',
      displayName: 'Super Administrator',
      description: 'Full system access with all permissions',
      permissions: ['users:read', 'users:write', 'users:delete', 'bases:read', 'bases:write', 'bases:delete', 'fleet:read', 'fleet:write', 'fleet:delete', 'roles:read', 'roles:write', 'roles:delete'],
      color: 'bg-red-100 text-red-800',
      userCount: 2
    },
    {
      id: 2,
      name: 'admin',
      displayName: 'Administrator',
      description: 'Administrative access with most permissions',
      permissions: ['users:read', 'users:write', 'bases:read', 'bases:write', 'fleet:read', 'fleet:write'],
      color: 'bg-purple-100 text-purple-800',
      userCount: 5
    },
    {
      id: 3,
      name: 'instructor',
      displayName: 'Flight Instructor',
      description: 'Flight instructor with training permissions',
      permissions: ['users:read', 'fleet:read', 'flights:read', 'flights:write'],
      color: 'bg-blue-100 text-blue-800',
      userCount: 12
    },
    {
      id: 4,
      name: 'pilot',
      displayName: 'Pilot',
      description: 'Licensed pilot with flight permissions',
      permissions: ['fleet:read', 'flights:read', 'flights:write'],
      color: 'bg-green-100 text-green-800',
      userCount: 25
    },
    {
      id: 5,
      name: 'student_pilot',
      displayName: 'Student Pilot',
      description: 'Student pilot with limited permissions',
      permissions: ['flights:read'],
      color: 'bg-yellow-100 text-yellow-800',
      userCount: 45
    }
  ]);

  const availablePermissions = [
    { key: 'users:read', label: 'View Users' },
    { key: 'users:write', label: 'Edit Users' },
    { key: 'users:delete', label: 'Delete Users' },
    { key: 'bases:read', label: 'View Bases' },
    { key: 'bases:write', label: 'Edit Bases' },
    { key: 'bases:delete', label: 'Delete Bases' },
    { key: 'fleet:read', label: 'View Fleet' },
    { key: 'fleet:write', label: 'Edit Fleet' },
    { key: 'fleet:delete', label: 'Delete Fleet' },
    { key: 'flights:read', label: 'View Flights' },
    { key: 'flights:write', label: 'Edit Flights' },
    { key: 'flights:delete', label: 'Delete Flights' },
    { key: 'roles:read', label: 'View Roles' },
    { key: 'roles:write', label: 'Edit Roles' },
    { key: 'roles:delete', label: 'Delete Roles' }
  ];

  const colorOptions = [
    { value: 'bg-red-100 text-red-800', label: 'Red' },
    { value: 'bg-purple-100 text-purple-800', label: 'Purple' },
    { value: 'bg-blue-100 text-blue-800', label: 'Blue' },
    { value: 'bg-green-100 text-green-800', label: 'Green' },
    { value: 'bg-yellow-100 text-yellow-800', label: 'Yellow' },
    { value: 'bg-gray-100 text-gray-800', label: 'Gray' }
  ];

  // Role management functions
  const handleRoleFormChange = (field: string, value: any) => {
    setRoleFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionToggle = (permission: string) => {
    setRoleFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const handleCreateRole = async () => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call
      const newRole = {
        id: roles.length + 1,
        ...roleFormData,
        userCount: 0
      };
      
      setRoles(prev => [...prev, newRole]);
      setShowAddRoleModal(false);
      setRoleFormData({
        name: '',
        displayName: '',
        description: '',
        permissions: [],
        color: 'bg-gray-100 text-gray-800'
      });
      alert('Role created successfully!');
    } catch (error) {
      alert('Error creating role. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setRoleFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      permissions: role.permissions || [],
      color: role.color
    });
    setShowEditRoleModal(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;
    
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call
      setRoles(prev => prev.map(role => 
        role.id === selectedRole.id 
          ? { ...role, ...roleFormData }
          : role
      ));
      setShowEditRoleModal(false);
      setSelectedRole(null);
      setRoleFormData({
        name: '',
        displayName: '',
        description: '',
        permissions: [],
        color: 'bg-gray-100 text-gray-800'
      });
      alert('Role updated successfully!');
    } catch (error) {
      alert('Error updating role. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (role: any) => {
    if (!confirm(`Are you sure you want to delete the "${role.displayName}" role? This action cannot be undone.`)) {
      return;
    }

    try {
      // In a real app, this would be an API call
      setRoles(prev => prev.filter(r => r.id !== role.id));
      alert('Role deleted successfully!');
    } catch (error) {
      alert('Error deleting role. Please try again.');
    }
  };

  const canManageRoles = currentUserRole === 'super_admin';

  return (
    <div className="h-full flex flex-col">
      {/* Header Section with Table Headers - Fixed at top */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
          {canManageRoles && (
            <button
              onClick={() => setShowAddRoleModal(true)}
              className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800"
            >
              Add Role
            </button>
          )}
        </div>
        <div className="px-6 py-3 bg-gray-50">
          <div className="grid grid-cols-5 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div>Role</div>
            <div>Description</div>
            <div>Users</div>
            <div>Permissions</div>
            <div>Actions</div>
          </div>
        </div>
      </div>

      {/* Table Container with Scrollable Body */}
      <div className="flex-1 flex flex-col">
        {/* Scrollable Table Body */}
        <div className="flex-1 overflow-auto">
          <div className="bg-white">
            <div className="divide-y divide-gray-200">
              {roles.map((role) => (
                <div key={role.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="grid grid-cols-5 gap-4 items-center">
                    {/* Role Column */}
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <Crown className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {role.displayName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {role.name}
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${role.color}`}>
                          {role.displayName.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Description Column */}
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {role.description}
                    </div>

                    {/* Users Column */}
                    <div className="text-sm text-gray-900">{role.userCount} users</div>

                    {/* Permissions Column */}
                    <div className="text-sm text-gray-900">
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map((permission, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {permission.split(':')[1]}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditRole(role)}
                        disabled={!canManageRoles}
                        className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role)}
                        disabled={!canManageRoles}
                        className="text-red-600 hover:text-red-900 px-2 py-1 rounded border border-red-200 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
              <h3 className="text-lg font-medium text-gray-900">Add New Role</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowAddRoleModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRole}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Basic Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                    <input
                      type="text"
                      value={roleFormData.name}
                      onChange={e => handleRoleFormChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="super_admin"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={roleFormData.displayName}
                      onChange={e => handleRoleFormChange('displayName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Super Administrator"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={roleFormData.description}
                      onChange={e => handleRoleFormChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Description of the role..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <select
                      value={roleFormData.color}
                      onChange={e => handleRoleFormChange('color', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {colorOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Permissions */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Permissions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availablePermissions.map(permission => (
                      <label key={permission.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={roleFormData.permissions.includes(permission.key)}
                          onChange={() => handlePermissionToggle(permission.key)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditRoleModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
              <h3 className="text-lg font-medium text-gray-900">Edit Role</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowEditRoleModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateRole}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Role'}
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Basic Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                    <input
                      type="text"
                      value={roleFormData.name}
                      onChange={e => handleRoleFormChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="super_admin"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={roleFormData.displayName}
                      onChange={e => handleRoleFormChange('displayName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Super Administrator"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={roleFormData.description}
                      onChange={e => handleRoleFormChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Description of the role..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <select
                      value={roleFormData.color}
                      onChange={e => handleRoleFormChange('color', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {colorOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Permissions */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Permissions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availablePermissions.map(permission => (
                      <label key={permission.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={roleFormData.permissions.includes(permission.key)}
                          onChange={() => handlePermissionToggle(permission.key)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement; 