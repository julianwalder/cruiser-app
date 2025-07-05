import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, Upload, MapPin } from 'lucide-react';

interface BaseManagementProps {
  userRole?: 'admin' | 'user' | 'super_admin' | 'base_manager';
}

const BaseManagement: React.FC<BaseManagementProps> = ({ userRole = 'user' }) => {
  // Determine if user has admin privileges for base management
  const isAdmin = userRole === 'admin' || userRole === 'super_admin' || userRole === 'base_manager';
  const [showAddBaseModal, setShowAddBaseModal] = useState(false);
  const [showViewBaseModal, setShowViewBaseModal] = useState(false);
  const [showEditBaseModal, setShowEditBaseModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bases, setBases] = useState<any[]>([]);
  const [selectedBase, setSelectedBase] = useState<any>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');

  const [baseFormData, setBaseFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    region: '',
    country: '',
    postalCode: '',
    latitude: '',
    longitude: '',
    icaoCode: '',
    iataCode: '',
    runwayLength: '',
    runwaySurface: '',
    elevation: '',
    frequency: '',
    operatingHours: '',
    phone: '',
    email: '',
    website: '',
    imageUrl: '',
    isActive: true
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Fetch bases from API
  const fetchBases = async () => {
    try {
      const response = await fetch('/api/admin/bases');
      if (response.ok) {
        const data = await response.json() as any[];
        setBases(data);
      } else {
        setBases([]);
      }
    } catch (e) {
      setBases([]);
    }
  };

  useEffect(() => {
    fetchBases();
  }, []);

  const handleBaseFormChange = (field: string, value: any) => {
    setBaseFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (file: File) => {
    setImageUploading(true);
    setImageUploadError('');
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/admin/bases/upload-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        setBaseFormData((prev) => ({ ...prev, imageUrl: data.url! }));
      } else {
        setImageUploadError(data.error || 'Upload failed');
      }
    } catch (e) {
      setImageUploadError('Upload failed');
    } finally {
      setImageUploading(false);
    }
  };

  const handleCreateBase = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/bases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...baseFormData,
          latitude: baseFormData.latitude ? parseFloat(baseFormData.latitude) : null,
          longitude: baseFormData.longitude ? parseFloat(baseFormData.longitude) : null,
        }),
      });

      if (response.ok) {
        const newBase = await response.json() as any;
        setShowAddBaseModal(false);
        setBaseFormData({
          name: '',
          description: '',
          address: '',
          city: '',
          region: '',
          country: '',
          postalCode: '',
          latitude: '',
          longitude: '',
          icaoCode: '',
          iataCode: '',
          runwayLength: '',
          runwaySurface: '',
          elevation: '',
          frequency: '',
          operatingHours: '',
          phone: '',
          email: '',
          website: '',
          imageUrl: '',
          isActive: true
        });
        alert('Base created successfully!');
        fetchBases();
      } else {
        const error = await response.json() as any;
        alert('Failed to create base. Please try again.');
      }
    } catch (error) {
      alert('Error creating base. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // View base handler
  const handleViewBase = (base: any) => {
    setSelectedBase(base);
    setShowViewBaseModal(true);
  };

  // Edit base handler
  const handleEditBase = (base: any) => {
    setSelectedBase(base);
    setBaseFormData({
      name: base.name || '',
      description: base.description || '',
      address: base.address || '',
      city: base.city || '',
      region: base.region || '',
      country: base.country || '',
      postalCode: base.postalCode || '',
      latitude: base.latitude ? base.latitude.toString() : '',
      longitude: base.longitude ? base.longitude.toString() : '',
      icaoCode: base.icaoCode || '',
      iataCode: base.iataCode || '',
      runwayLength: base.runwayLength || '',
      runwaySurface: base.runwaySurface || '',
      elevation: base.elevation || '',
      frequency: base.frequency || '',
      operatingHours: base.operatingHours || '',
      phone: base.phone || '',
      email: base.email || '',
      website: base.website || '',
      imageUrl: base.imageUrl || '',
      isActive: base.isActive
    });
    setShowEditBaseModal(true);
  };

  // Update base handler
  const handleUpdateBase = async () => {
    if (!selectedBase) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/bases/${selectedBase.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...baseFormData,
          latitude: baseFormData.latitude ? parseFloat(baseFormData.latitude) : null,
          longitude: baseFormData.longitude ? parseFloat(baseFormData.longitude) : null,
        }),
      });

      if (response.ok) {
        setShowEditBaseModal(false);
        setSelectedBase(null);
        setBaseFormData({
          name: '',
          description: '',
          address: '',
          city: '',
          region: '',
          country: '',
          postalCode: '',
          latitude: '',
          longitude: '',
          icaoCode: '',
          iataCode: '',
          runwayLength: '',
          runwaySurface: '',
          elevation: '',
          frequency: '',
          operatingHours: '',
          phone: '',
          email: '',
          website: '',
          imageUrl: '',
          isActive: true
        });
        alert('Base updated successfully!');
        fetchBases();
      } else {
        alert('Failed to update base. Please try again.');
      }
    } catch (error) {
      alert('Error updating base. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete base handler
  const handleDeleteBase = async (base: any) => {
    if (!confirm(`Are you sure you want to delete "${base.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/bases/${base.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Base deleted successfully!');
        fetchBases();
      } else {
        alert('Failed to delete base. Please try again.');
      }
    } catch (error) {
      alert('Error deleting base. Please try again.');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header Section - Fixed at top */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Base Management' : 'Available Bases'}
          </h2>
          {isAdmin && (
            <button
              onClick={() => setShowAddBaseModal(true)}
              className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800"
            >
              Add Base
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto py-6 px-0">
        {/* Bases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bases.map((base) => (
          <div key={base.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Image Section - 16:9 Aspect Ratio */}
            <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
              {base.imageUrl ? (
                <img 
                  src={`${API_URL}${base.imageUrl}`} 
                  alt={base.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-gray-400" />
                </div>
              )}
              {/* Status Badge Overlay */}
              <div className="absolute top-3 right-3">
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${base.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {base.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 text-lg mb-1">{base.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{base.city}, {base.country}</p>
              {base.icaoCode && (
                <p className="text-xs text-gray-400 mb-4">ICAO: {base.icaoCode}</p>
              )}
              
              {/* Action Links */}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex space-x-3 text-sm">
                  <button
                    onClick={() => handleViewBase(base)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Details
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleEditBase(base)}
                        className="text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBase(base)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* Add Base Modal */}
      {showAddBaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
              <h3 className="text-lg font-medium text-gray-900">Add New Base</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowAddBaseModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBase}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Base'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Name</label>
                    <input
                      type="text"
                      value={baseFormData.name}
                      onChange={e => handleBaseFormChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Main Base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={baseFormData.description}
                      onChange={e => handleBaseFormChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Description of the base..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={baseFormData.address}
                      onChange={e => handleBaseFormChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123 Airport Road"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={baseFormData.city}
                        onChange={e => handleBaseFormChange('city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={baseFormData.country}
                        onChange={e => handleBaseFormChange('country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="USA"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ICAO Code</label>
                      <input
                        type="text"
                        value={baseFormData.icaoCode}
                        onChange={e => handleBaseFormChange('icaoCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="KJFK"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IATA Code</label>
                      <input
                        type="text"
                        value={baseFormData.iataCode}
                        onChange={e => handleBaseFormChange('iataCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="JFK"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Image</label>
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
                      {baseFormData.imageUrl && (
                        <div className="w-32 h-32 bg-gray-100 rounded-md overflow-hidden">
                          <img 
                            src={`${API_URL}${baseFormData.imageUrl}`} 
                            alt="Base preview" 
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
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={baseFormData.latitude}
                        onChange={e => handleBaseFormChange('latitude', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="40.7128"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={baseFormData.longitude}
                        onChange={e => handleBaseFormChange('longitude', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="-74.0060"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Runway Length (ft)</label>
                      <input
                        type="text"
                        value={baseFormData.runwayLength}
                        onChange={e => handleBaseFormChange('runwayLength', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="8000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Runway Surface</label>
                      <input
                        type="text"
                        value={baseFormData.runwaySurface}
                        onChange={e => handleBaseFormChange('runwaySurface', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Asphalt"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Elevation (ft)</label>
                      <input
                        type="text"
                        value={baseFormData.elevation}
                        onChange={e => handleBaseFormChange('elevation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="13"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Frequency (MHz)</label>
                      <input
                        type="text"
                        value={baseFormData.frequency}
                        onChange={e => handleBaseFormChange('frequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="118.1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Operating Hours</label>
                    <input
                      type="text"
                      value={baseFormData.operatingHours}
                      onChange={e => handleBaseFormChange('operatingHours', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="24/7"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={baseFormData.phone}
                      onChange={e => handleBaseFormChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={baseFormData.email}
                      onChange={e => handleBaseFormChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="info@base.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={baseFormData.website}
                      onChange={e => handleBaseFormChange('website', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://base.com"
                    />
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={baseFormData.isActive}
                        onChange={e => handleBaseFormChange('isActive', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active Base</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Base Modal */}
      {showViewBaseModal && selectedBase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
              <h3 className="text-lg font-medium text-gray-900">View Base</h3>
              <button
                onClick={() => setShowViewBaseModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Base Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    {selectedBase.imageUrl ? (
                      <img 
                        src={`${API_URL}${selectedBase.imageUrl}`} 
                        alt={selectedBase.name} 
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <MapPin className="w-8 h-8 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{selectedBase.name}</h4>
                    <p className="text-gray-500">{selectedBase.city}, {selectedBase.country}</p>
                    <div className="flex space-x-2 mt-2">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${selectedBase.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {selectedBase.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                      {selectedBase.icaoCode && (
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          ICAO: {selectedBase.icaoCode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Base Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Location Information</h5>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{selectedBase.address || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{selectedBase.city || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{selectedBase.country || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Coordinates</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                        {selectedBase.latitude && selectedBase.longitude 
                          ? `${selectedBase.latitude}, ${selectedBase.longitude}` 
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Airport Information</h5>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Runway Length</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{selectedBase.runwayLength || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Runway Surface</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{selectedBase.runwaySurface || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Elevation</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{selectedBase.elevation || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{selectedBase.frequency || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Base Image */}
                {selectedBase.imageUrl && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Base Image</h5>
                    <div className="w-full max-w-md bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={`${API_URL}${selectedBase.imageUrl}`} 
                        alt={selectedBase.name} 
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

      {/* Edit Base Modal */}
      {showEditBaseModal && selectedBase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
              <h3 className="text-lg font-medium text-gray-900">Edit Base</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowEditBaseModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateBase}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Base'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Name</label>
                    <input
                      type="text"
                      value={baseFormData.name}
                      onChange={e => handleBaseFormChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Main Base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={baseFormData.description}
                      onChange={e => handleBaseFormChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Description of the base..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={baseFormData.address}
                      onChange={e => handleBaseFormChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123 Airport Road"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={baseFormData.city}
                        onChange={e => handleBaseFormChange('city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={baseFormData.country}
                        onChange={e => handleBaseFormChange('country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="USA"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ICAO Code</label>
                      <input
                        type="text"
                        value={baseFormData.icaoCode}
                        onChange={e => handleBaseFormChange('icaoCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="KJFK"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IATA Code</label>
                      <input
                        type="text"
                        value={baseFormData.iataCode}
                        onChange={e => handleBaseFormChange('iataCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="JFK"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Image</label>
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
                      {baseFormData.imageUrl && (
                        <div className="w-32 h-32 bg-gray-100 rounded-md overflow-hidden">
                          <img 
                            src={`${API_URL}${baseFormData.imageUrl}`} 
                            alt="Base preview" 
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
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={baseFormData.latitude}
                        onChange={e => handleBaseFormChange('latitude', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="40.7128"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={baseFormData.longitude}
                        onChange={e => handleBaseFormChange('longitude', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="-74.0060"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Runway Length (ft)</label>
                      <input
                        type="text"
                        value={baseFormData.runwayLength}
                        onChange={e => handleBaseFormChange('runwayLength', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="8000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Runway Surface</label>
                      <input
                        type="text"
                        value={baseFormData.runwaySurface}
                        onChange={e => handleBaseFormChange('runwaySurface', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Asphalt"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Elevation (ft)</label>
                      <input
                        type="text"
                        value={baseFormData.elevation}
                        onChange={e => handleBaseFormChange('elevation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="13"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Frequency (MHz)</label>
                      <input
                        type="text"
                        value={baseFormData.frequency}
                        onChange={e => handleBaseFormChange('frequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="118.1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Operating Hours</label>
                    <input
                      type="text"
                      value={baseFormData.operatingHours}
                      onChange={e => handleBaseFormChange('operatingHours', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="24/7"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={baseFormData.phone}
                      onChange={e => handleBaseFormChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={baseFormData.email}
                      onChange={e => handleBaseFormChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="info@base.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={baseFormData.website}
                      onChange={e => handleBaseFormChange('website', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://base.com"
                    />
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={baseFormData.isActive}
                        onChange={e => handleBaseFormChange('isActive', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active Base</span>
                    </label>
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

export default BaseManagement; 