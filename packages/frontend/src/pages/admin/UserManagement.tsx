import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, Upload, X } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [updatingUser, setUpdatingUser] = useState(false);
  const [userUpdateKey, setUserUpdateKey] = useState(0);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for when API is not available
  const mockUsers = [
    {
      id: 1,
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1 (555) 123-4567',
      role: 'student_pilot',
      status: 'active',
      createdAt: '2024-01-15T10:30:00Z',
      imageUrl: null
    },
    {
      id: 2,
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+1 (555) 987-6543',
      role: 'instructor',
      status: 'active',
      createdAt: '2024-01-10T14:20:00Z',
      imageUrl: null
    },
    {
      id: 3,
      email: 'mike.wilson@example.com',
      firstName: 'Mike',
      lastName: 'Wilson',
      phoneNumber: '+1 (555) 456-7890',
      role: 'pilot',
      status: 'pending',
      createdAt: '2024-01-20T09:15:00Z',
      imageUrl: null
    }
  ];

  const [userFormData, setUserFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'student_pilot',
    status: 'pending',
    address: '',
    city: '',
    region: '',
    country: '',
    postalCode: '',
    nationality: '',
    dateOfBirth: '',
    nationalId: '',
    sex: '',
    imageUrl: '',
    hasPPL: false,
    pplNumber: '',
    pplIssueDate: '',
    pplExpiryDate: '',
    medicalCertificateNumber: '',
    medicalExamDate: '',
    medicalIssueDate: '',
    medicalExpiryDate: '',
    totalFlightHours: 0,
    creditedHours: 0
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Fetch users from API
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.log('API not available, using mock data');
        setUsers(mockUsers);
      }
    } catch (e) {
      console.log('API error, using mock data:', e);
      setUsers(mockUsers);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserFormChange = (field: string, value: any) => {
    setUserFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/users/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        handleUserFormChange('imageUrl', data.url);
        alert('Image uploaded successfully!');
      } else {
        alert('Failed to upload image. Please try again.');
      }
    } catch (error) {
      alert('Error uploading image. Please try again.');
    }
  };

  // User CRUD functions
  const handleCreateUser = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userFormData,
          dateOfBirth: userFormData.dateOfBirth ? new Date(userFormData.dateOfBirth).toISOString() : null,
          pplIssueDate: userFormData.pplIssueDate ? new Date(userFormData.pplIssueDate).toISOString() : null,
          pplExpiryDate: userFormData.pplExpiryDate ? new Date(userFormData.pplExpiryDate).toISOString() : null,
          medicalExamDate: userFormData.medicalExamDate ? new Date(userFormData.medicalExamDate).toISOString() : null,
          medicalIssueDate: userFormData.medicalIssueDate ? new Date(userFormData.medicalIssueDate).toISOString() : null,
          medicalExpiryDate: userFormData.medicalExpiryDate ? new Date(userFormData.medicalExpiryDate).toISOString() : null,
          totalFlightHours: parseInt(userFormData.totalFlightHours.toString()),
          creditedHours: parseInt(userFormData.creditedHours.toString()),
        }),
      });

      if (response.ok) {
        const newUser = await response.json();
        setShowAddUserModal(false);
        setUserFormData({
          email: '',
          firstName: '',
          lastName: '',
          phoneNumber: '',
          role: 'student_pilot',
          status: 'pending',
          address: '',
          city: '',
          region: '',
          country: '',
          postalCode: '',
          nationality: '',
          dateOfBirth: '',
          nationalId: '',
          sex: '',
          imageUrl: '',
          hasPPL: false,
          pplNumber: '',
          pplIssueDate: '',
          pplExpiryDate: '',
          medicalCertificateNumber: '',
          medicalExamDate: '',
          medicalIssueDate: '',
          medicalExpiryDate: '',
          totalFlightHours: 0,
          creditedHours: 0
        });
        alert('User created successfully!');
        fetchUsers();
      } else {
        const error = await response.json();
        alert('Failed to create user. Please try again.');
      }
    } catch (error) {
      alert('Error creating user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // View user handler
  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowViewUserModal(true);
  };

  // Edit user handler
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setUserFormData({
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phoneNumber: user.phoneNumber || '',
      role: user.role || 'student_pilot',
      status: user.status || 'pending',
      address: user.address || '',
      city: user.city || '',
      region: user.region || '',
      country: user.country || '',
      postalCode: user.postalCode || '',
      nationality: user.nationality || '',
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      nationalId: user.nationalId || '',
      sex: user.sex || '',
      imageUrl: user.imageUrl || '',
      hasPPL: user.hasPPL || false,
      pplNumber: user.pplNumber || '',
      pplIssueDate: user.pplIssueDate ? new Date(user.pplIssueDate).toISOString().split('T')[0] : '',
      pplExpiryDate: user.pplExpiryDate ? new Date(user.pplExpiryDate).toISOString().split('T')[0] : '',
      medicalCertificateNumber: user.medicalCertificateNumber || '',
      medicalExamDate: user.medicalExamDate ? new Date(user.medicalExamDate).toISOString().split('T')[0] : '',
      medicalIssueDate: user.medicalIssueDate ? new Date(user.medicalIssueDate).toISOString().split('T')[0] : '',
      medicalExpiryDate: user.medicalExpiryDate ? new Date(user.medicalExpiryDate).toISOString().split('T')[0] : '',
      totalFlightHours: user.totalFlightHours || 0,
      creditedHours: user.creditedHours || 0
    });
    setShowEditUserModal(true);
  };

  // Update user handler
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    setUpdatingUser(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userFormData,
          dateOfBirth: userFormData.dateOfBirth ? new Date(userFormData.dateOfBirth).toISOString() : null,
          pplIssueDate: userFormData.pplIssueDate ? new Date(userFormData.pplIssueDate).toISOString() : null,
          pplExpiryDate: userFormData.pplExpiryDate ? new Date(userFormData.pplExpiryDate).toISOString() : null,
          medicalExamDate: userFormData.medicalExamDate ? new Date(userFormData.medicalExamDate).toISOString() : null,
          medicalIssueDate: userFormData.medicalIssueDate ? new Date(userFormData.medicalIssueDate).toISOString() : null,
          medicalExpiryDate: userFormData.medicalExpiryDate ? new Date(userFormData.medicalExpiryDate).toISOString() : null,
          totalFlightHours: parseInt(userFormData.totalFlightHours.toString()),
          creditedHours: parseInt(userFormData.creditedHours.toString()),
        }),
      });

      if (response.ok) {
        setShowEditUserModal(false);
        setSelectedUser(null);
        setUserFormData({
          email: '',
          firstName: '',
          lastName: '',
          phoneNumber: '',
          role: 'student_pilot',
          status: 'pending',
          address: '',
          city: '',
          region: '',
          country: '',
          postalCode: '',
          nationality: '',
          dateOfBirth: '',
          nationalId: '',
          sex: '',
          imageUrl: '',
          hasPPL: false,
          pplNumber: '',
          pplIssueDate: '',
          pplExpiryDate: '',
          medicalCertificateNumber: '',
          medicalExamDate: '',
          medicalIssueDate: '',
          medicalExpiryDate: '',
          totalFlightHours: 0,
          creditedHours: 0
        });
        alert('User updated successfully!');
        setUserUpdateKey(prev => prev + 1);
        fetchUsers();
      } else {
        alert('Failed to update user. Please try again.');
      }
    } catch (error) {
      alert('Error updating user. Please try again.');
    } finally {
      setUpdatingUser(false);
    }
  };

  // Delete user handler
  const handleDeleteUser = async (user: any) => {
    if (!confirm(`Are you sure you want to delete "${user.firstName} ${user.lastName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('User deleted successfully!');
        fetchUsers();
      } else {
        alert('Failed to delete user. Please try again.');
      }
    } catch (error) {
      alert('Error deleting user. Please try again.');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'instructor': return 'bg-blue-100 text-blue-800';
      case 'pilot': return 'bg-green-100 text-green-800';
      case 'student_pilot': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header Section with Table Headers - Fixed at top */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800 transition-colors"
          >
            Add User
          </button>
        </div>
        <div className="px-6 py-3 bg-gray-50">
          <div className="grid grid-cols-6 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div>User</div>
            <div>Email</div>
            <div>Role</div>
            <div>Status</div>
            <div>Created</div>
            <div>Actions</div>
          </div>
        </div>
      </div>

      {/* Table Container with Scrollable Body */}
      <div className="flex-1 flex flex-col">
        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          </div>
        )}
        
        {/* Scrollable Table Body */}
        {!isLoading && (
          <div className="flex-1 overflow-auto">
            <div className="bg-white">
              <div className="divide-y divide-gray-200">
                {users.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-gray-500">No users found</p>
                  </div>
                ) : (
                                    users.map((user) => (
                    <div key={user.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="grid grid-cols-6 gap-4 items-center">
                        {/* User Column */}
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            {user.imageUrl ? (
                              <img 
                                src={`${API_URL}${user.imageUrl}`} 
                                alt={`${user.firstName} ${user.lastName}`} 
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-500 text-sm">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.phoneNumber || 'No phone'}
                            </div>
                          </div>
                        </div>

                        {/* Email Column */}
                        <div className="text-sm text-gray-900">{user.email}</div>

                        {/* Role Column */}
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                            {user.role?.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>

                        {/* Status Column */}
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                            {user.status?.toUpperCase()}
                          </span>
                        </div>

                        {/* Created Column */}
                        <div className="text-sm text-gray-500">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </div>

                        {/* Actions Column */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-900 px-2 py-1 rounded border border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
              <h3 className="text-lg font-medium text-gray-900">Add New User</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Basic Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={userFormData.email}
                      onChange={e => handleUserFormChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="user@example.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        value={userFormData.firstName}
                        onChange={e => handleUserFormChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={userFormData.lastName}
                        onChange={e => handleUserFormChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={userFormData.phoneNumber}
                      onChange={e => handleUserFormChange('phoneNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        value={userFormData.role}
                        onChange={e => handleUserFormChange('role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="student_pilot">Student Pilot</option>
                        <option value="pilot">Pilot</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={userFormData.status}
                        onChange={e => handleUserFormChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {userFormData.imageUrl && (
                        <div className="w-32 h-32 bg-gray-100 rounded-md overflow-hidden">
                          <img 
                            src={`${API_URL}${userFormData.imageUrl}`} 
                            alt="Profile preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Additional Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={userFormData.address}
                      onChange={e => handleUserFormChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123 Main St"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={userFormData.city}
                        onChange={e => handleUserFormChange('city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={userFormData.country}
                        onChange={e => handleUserFormChange('country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="USA"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={userFormData.dateOfBirth}
                        onChange={e => handleUserFormChange('dateOfBirth', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                      <input
                        type="text"
                        value={userFormData.nationality}
                        onChange={e => handleUserFormChange('nationality', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="American"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Flight Hours</label>
                      <input
                        type="number"
                        value={userFormData.totalFlightHours}
                        onChange={e => handleUserFormChange('totalFlightHours', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Credited Hours</label>
                      <input
                        type="number"
                        value={userFormData.creditedHours}
                        onChange={e => handleUserFormChange('creditedHours', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
              <h3 className="text-lg font-medium text-gray-900">View User</h3>
              <button
                onClick={() => setShowViewUserModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* User Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    {selectedUser.imageUrl ? (
                      <img 
                        src={`${API_URL}${selectedUser.imageUrl}`} 
                        alt={`${selectedUser.firstName} ${selectedUser.lastName}`} 
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 text-xl">
                        {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h4>
                    <p className="text-gray-500">{selectedUser.email}</p>
                    <div className="flex space-x-2 mt-2">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(selectedUser.role)}`}>
                        {selectedUser.role?.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedUser.status)}`}>
                        {selectedUser.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Contact Information</h5>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{selectedUser.phoneNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{selectedUser.address || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{selectedUser.city || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{selectedUser.country || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Flight Information</h5>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Flight Hours</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{selectedUser.totalFlightHours || 0}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Credited Hours</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{selectedUser.creditedHours || 0}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                        {selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{selectedUser.nationality || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* User Image */}
                {selectedUser.imageUrl && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Profile Image</h5>
                    <div className="w-full max-w-md bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={`${API_URL}${selectedUser.imageUrl}`} 
                        alt={`${selectedUser.firstName} ${selectedUser.lastName}`} 
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
              <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateUser}
                  disabled={updatingUser}
                  className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {updatingUser ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Basic Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={userFormData.email}
                      onChange={e => handleUserFormChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="user@example.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        value={userFormData.firstName}
                        onChange={e => handleUserFormChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={userFormData.lastName}
                        onChange={e => handleUserFormChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={userFormData.phoneNumber}
                      onChange={e => handleUserFormChange('phoneNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        value={userFormData.role}
                        onChange={e => handleUserFormChange('role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="student_pilot">Student Pilot</option>
                        <option value="pilot">Pilot</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={userFormData.status}
                        onChange={e => handleUserFormChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {userFormData.imageUrl && (
                        <div className="w-32 h-32 bg-gray-100 rounded-md overflow-hidden">
                          <img 
                            src={`${API_URL}${userFormData.imageUrl}`} 
                            alt="Profile preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Additional Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={userFormData.address}
                      onChange={e => handleUserFormChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123 Main St"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={userFormData.city}
                        onChange={e => handleUserFormChange('city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={userFormData.country}
                        onChange={e => handleUserFormChange('country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="USA"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={userFormData.dateOfBirth}
                        onChange={e => handleUserFormChange('dateOfBirth', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                      <input
                        type="text"
                        value={userFormData.nationality}
                        onChange={e => handleUserFormChange('nationality', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="American"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Flight Hours</label>
                      <input
                        type="number"
                        value={userFormData.totalFlightHours}
                        onChange={e => handleUserFormChange('totalFlightHours', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Credited Hours</label>
                      <input
                        type="number"
                        value={userFormData.creditedHours}
                        onChange={e => handleUserFormChange('creditedHours', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
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

export default UserManagement; 