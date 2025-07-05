import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, Upload, Plane } from 'lucide-react';

interface FleetManagementProps {
  userRole?: 'admin' | 'user' | 'super_admin' | 'base_manager';
}

const FleetManagement: React.FC<FleetManagementProps> = ({ userRole = 'user' }) => {
  // Determine if user has admin privileges for fleet management
  const isAdmin = userRole === 'admin' || userRole === 'super_admin' || userRole === 'base_manager';
  
  const [fleet, setFleet] = useState<any[]>([]);
  const [bases, setBases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddAircraftModal, setShowAddAircraftModal] = useState(false);
  const [showEditAircraftModal, setShowEditAircraftModal] = useState(false);
  const [showViewAircraftModal, setShowViewAircraftModal] = useState(false);
  const [selectedAircraft, setSelectedAircraft] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [aircraftFormData, setAircraftFormData] = useState({
    callSign: '',
    type: '',
    manufacturer: '',
    model: '',
    seats: 4,
    maxRange: 0,
    cruiseSpeed: 0,
    fuelCapacity: 0,
    yearManufactured: new Date().getFullYear(),
    description: '',
    isActive: true,
    baseId: '',
    imageUrl: '',
    totalFlightHours: 0
  });

  // Use relative URLs for API requests - the worker will proxy them
  const API_URL = '';

  // Fetch aircraft and bases data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch aircraft
        const aircraftResponse = await fetch(`${API_URL}/api/admin/aircraft`);
        if (aircraftResponse.ok) {
          const aircraftData = await aircraftResponse.json();
          setFleet(aircraftData as any[]);
        } else {
          console.error('Failed to fetch aircraft:', aircraftResponse.status, aircraftResponse.statusText);
          setError('Failed to load aircraft data. Please try again later.');
        }

        // Fetch bases
        const basesResponse = await fetch(`${API_URL}/api/admin/bases`);
        if (basesResponse.ok) {
          const basesData = await basesResponse.json();
          setBases(basesData as any[]);
        } else {
          console.error('Failed to fetch bases:', basesResponse.status, basesResponse.statusText);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error connecting to server. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  const handleAircraftFormChange = (field: string, value: any) => {
    setAircraftFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper function to get base name by ID
  const getBaseNameById = (baseId: string) => {
    const base = bases.find(b => b.id === baseId);
    return base ? `${base.name} (${base.icaoCode})` : 'Unknown Base';
  };

  // Helper function to get only ICAO code by base ID
  const getIcaoCodeById = (baseId: string) => {
    const base = bases.find(b => b.id === baseId);
    return base ? base.icaoCode : 'N/A';
  };

  const handleAircraftImageUpload = async (file: File) => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file size must be less than 5MB.');
        return;
      }

      const formData = new FormData();
      formData.append('file', file); // Changed from 'image' to 'file' to match backend
      
      console.log('Uploading image:', file.name, 'Size:', file.size);
      
      const response = await fetch('/api/admin/aircraft/upload-image', {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Upload success:', data);
        handleAircraftFormChange('imageUrl', (data as any).url);
        alert('Aircraft image uploaded successfully!');
      } else {
        const errorData = await response.text();
        console.error('Upload failed:', errorData);
        alert(`Failed to upload aircraft image: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading aircraft image. Please check your connection and try again.');
    }
  };

  const handleCreateAircraft = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/aircraft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aircraftFormData),
      });

      if (response.ok) {
        const newAircraft = await response.json();
        setFleet(prev => [...prev, newAircraft]);
        setShowAddAircraftModal(false);
        setAircraftFormData({
          callSign: '',
          type: '',
          manufacturer: '',
          model: '',
          seats: 4,
          maxRange: 0,
          cruiseSpeed: 0,
          fuelCapacity: 0,
          yearManufactured: new Date().getFullYear(),
          description: '',
          isActive: true,
          baseId: '',
          imageUrl: '',
          totalFlightHours: 0
        });
        alert('Aircraft created successfully!');
      } else {
        const errorData = await response.text();
        console.error('Failed to create aircraft:', errorData);
        alert('Error creating aircraft. Please try again.');
      }
    } catch (error) {
      console.error('Error creating aircraft:', error);
      alert('Error creating aircraft. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewAircraft = (aircraft: any) => {
    setSelectedAircraft(aircraft);
    setShowViewAircraftModal(true);
  };

  const handleEditAircraft = (aircraft: any) => {
    setSelectedAircraft(aircraft);
    setAircraftFormData({
      callSign: aircraft.callSign || '',
      type: aircraft.type || '',
      manufacturer: aircraft.manufacturer || '',
      model: aircraft.model || '',
      seats: aircraft.seats || 4,
      maxRange: aircraft.maxRange || 0,
      cruiseSpeed: aircraft.cruiseSpeed || 0,
      fuelCapacity: aircraft.fuelCapacity || 0,
      yearManufactured: aircraft.yearManufactured || new Date().getFullYear(),
      description: aircraft.description || '',
      isActive: aircraft.isActive,
      baseId: aircraft.baseId || 1,
      imageUrl: aircraft.imageUrl || '',
      totalFlightHours: aircraft.totalFlightHours || 0
    });
    setShowEditAircraftModal(true);
  };

  const handleUpdateAircraft = async () => {
    if (!selectedAircraft) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/aircraft/${selectedAircraft.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aircraftFormData),
      });

      if (response.ok) {
        const updatedAircraft = await response.json();
        setFleet(prev => prev.map(aircraft => 
          aircraft.id === selectedAircraft.id 
            ? updatedAircraft
            : aircraft
        ));
        setShowEditAircraftModal(false);
        setSelectedAircraft(null);
        setAircraftFormData({
          callSign: '',
          type: '',
          manufacturer: '',
          model: '',
          seats: 4,
          maxRange: 0,
          cruiseSpeed: 0,
          fuelCapacity: 0,
          yearManufactured: new Date().getFullYear(),
          description: '',
          isActive: true,
          baseId: '',
          imageUrl: '',
          totalFlightHours: 0
        });
        alert('Aircraft updated successfully!');
      } else {
        const errorData = await response.text();
        console.error('Failed to update aircraft:', errorData);
        alert('Error updating aircraft. Please try again.');
      }
    } catch (error) {
      console.error('Error updating aircraft:', error);
      alert('Error updating aircraft. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAircraft = async (aircraft: any) => {
    if (!confirm(`Are you sure you want to delete "${aircraft.callSign}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/aircraft/${aircraft.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFleet(prev => prev.filter(a => a.id !== aircraft.id));
        alert('Aircraft deleted successfully!');
      } else {
        const errorData = await response.text();
        console.error('Failed to delete aircraft:', errorData);
        alert('Error deleting aircraft. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting aircraft:', error);
      alert('Error deleting aircraft. Please try again.');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header Section - Fixed at top */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Fleet Management' : 'Available Aircraft'}
          </h2>
          {isAdmin && (
            <button
              onClick={() => {
                          setAircraftFormData({
              callSign: '',
              type: '',
              manufacturer: '',
              model: '',
              seats: 4,
              maxRange: 0,
              cruiseSpeed: 0,
              fuelCapacity: 0,
              yearManufactured: new Date().getFullYear(),
              description: '',
              isActive: true,
              baseId: '',
              imageUrl: '',
              totalFlightHours: 0
            });
            setShowAddAircraftModal(true);
            }}
            className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800"
          >
            Add Aircraft
          </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto py-6 px-0">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading aircraft data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Aircraft</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Fleet Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fleet.map((aircraft) => (
          <div key={aircraft.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col min-h-[400px]">
            {/* Image Section - 16:9 Aspect Ratio */}
            <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
              {aircraft.imageUrl ? (
                <img 
                  src={`${API_URL}${aircraft.imageUrl}`} 
                  alt={aircraft.callSign} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Plane className="w-12 h-12 text-gray-400" />
                </div>
              )}
              {/* Status Badge Overlay */}
              <div className="absolute top-3 right-3">
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${aircraft.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {aircraft.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="p-4 flex flex-col flex-1">
              <div className="flex-1">
                {/* Header */}
                <div className="mb-3">
                  <div className="mb-1">
                    <h3 className="font-bold text-gray-900 text-lg">{aircraft.callSign}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 font-medium">{aircraft.model}</span>
                      <span className="text-sm text-gray-600">{aircraft.manufacturer}</span>
                    </div>
                  </div>
                </div>
                
                {/* Key Specifications */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Seats</div>
                    <div className="text-sm font-semibold text-gray-900">{aircraft.seats}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Year</div>
                    <div className="text-sm font-semibold text-gray-900">{aircraft.yearManufactured}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Speed</div>
                    <div className="text-sm font-semibold text-gray-900">{aircraft.cruiseSpeed} kts</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Range</div>
                    <div className="text-sm font-semibold text-gray-900">{aircraft.maxRange} nm</div>
                  </div>
                </div>
                
                {/* Additional Info */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Type</div>
                    <div className="text-sm font-semibold text-gray-900">{aircraft.type}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Base</div>
                    <div className="text-sm font-semibold text-gray-900">{getIcaoCodeById(aircraft.baseId)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Hours</div>
                    <div className="text-sm font-semibold text-gray-900">{aircraft.totalFlightHours?.toLocaleString() || '0'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Fuel</div>
                    <div className="text-sm font-semibold text-gray-900">{aircraft.fuelCapacity} L</div>
                  </div>
                </div>
              </div>
              
              {/* Action Links */}
              <div className="border-t border-gray-200 pt-3 mt-4">
                <div className="flex space-x-3 text-sm">
                  <button
                    onClick={() => handleViewAircraft(aircraft)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Details
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleEditAircraft(aircraft)}
                        className="text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAircraft(aircraft)}
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
        )}
      </div>

      {/* Add Aircraft Modal */}
      {showAddAircraftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
              <h3 className="text-lg font-medium text-gray-900">Add New Aircraft</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowAddAircraftModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAircraft}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Aircraft'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Call Sign</label>
                    <input
                      type="text"
                      value={aircraftFormData.callSign}
                      onChange={e => handleAircraftFormChange('callSign', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <input
                      type="text"
                      value={aircraftFormData.type}
                      onChange={e => handleAircraftFormChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                      <input
                        type="text"
                        value={aircraftFormData.manufacturer}
                        onChange={e => handleAircraftFormChange('manufacturer', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                      <input
                        type="text"
                        value={aircraftFormData.model}
                        onChange={e => handleAircraftFormChange('model', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base</label>
                    <select
                      value={aircraftFormData.baseId || ''}
                      onChange={e => handleAircraftFormChange('baseId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a base</option>
                      {bases.map(base => (
                        <option key={base.id} value={base.id}>
                          {base.name} ({base.icaoCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aircraft Image</label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAircraftImageUpload(file);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {aircraftFormData.imageUrl && (
                        <div className="w-32 h-32 bg-gray-100 rounded-md overflow-hidden">
                          <img 
                            src={`${API_URL}${aircraftFormData.imageUrl}`} 
                            alt="Aircraft preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={aircraftFormData.description}
                      onChange={e => handleAircraftFormChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Specifications */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Specifications</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
                      <input
                        type="number"
                        value={aircraftFormData.seats}
                        onChange={e => handleAircraftFormChange('seats', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year Manufactured</label>
                      <input
                        type="number"
                        value={aircraftFormData.yearManufactured}
                        onChange={e => handleAircraftFormChange('yearManufactured', parseInt(e.target.value) || new Date().getFullYear())}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Flight Hours</label>
                    <input
                      type="number"
                      value={aircraftFormData.totalFlightHours}
                      onChange={e => handleAircraftFormChange('totalFlightHours', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Range (nm)</label>
                      <input
                        type="number"
                        value={aircraftFormData.maxRange}
                        onChange={e => handleAircraftFormChange('maxRange', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cruise Speed (kts)</label>
                      <input
                        type="number"
                        value={aircraftFormData.cruiseSpeed}
                        onChange={e => handleAircraftFormChange('cruiseSpeed', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Capacity (L)</label>
                    <input
                      type="number"
                      value={aircraftFormData.fuelCapacity}
                      onChange={e => handleAircraftFormChange('fuelCapacity', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={aircraftFormData.isActive}
                        onChange={e => handleAircraftFormChange('isActive', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active Aircraft</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Aircraft Modal */}
      {showViewAircraftModal && selectedAircraft && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
              <h3 className="text-lg font-medium text-gray-900">View Aircraft</h3>
              <button
                onClick={() => setShowViewAircraftModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Aircraft Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    {selectedAircraft.imageUrl ? (
                      <img 
                        src={`${API_URL}${selectedAircraft.imageUrl}`} 
                        alt={selectedAircraft.callSign} 
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <Plane className="w-8 h-8 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{selectedAircraft.callSign}</h4>
                    <p className="text-gray-500">{selectedAircraft.manufacturer} {selectedAircraft.model}</p>
                    <div className="flex space-x-2 mt-2">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${selectedAircraft.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {selectedAircraft.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {selectedAircraft.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Aircraft Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Aircraft Information</h5>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{selectedAircraft.manufacturer || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{selectedAircraft.model || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year Manufactured</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{selectedAircraft.yearManufactured || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Base</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{getBaseNameById(selectedAircraft.baseId)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Specifications</h5>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{selectedAircraft.seats || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Range</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{selectedAircraft.maxRange ? `${selectedAircraft.maxRange} nm` : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cruise Speed</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{selectedAircraft.cruiseSpeed ? `${selectedAircraft.cruiseSpeed} kts` : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Capacity</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{selectedAircraft.fuelCapacity ? `${selectedAircraft.fuelCapacity} L` : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {selectedAircraft.description && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                    <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded">{selectedAircraft.description}</p>
                  </div>
                )}

                {/* Aircraft Image */}
                {selectedAircraft.imageUrl && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Aircraft Image</h5>
                    <div className="w-full max-w-md bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={`${API_URL}${selectedAircraft.imageUrl}`} 
                        alt={selectedAircraft.callSign} 
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

      {/* Edit Aircraft Modal */}
      {showEditAircraftModal && selectedAircraft && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
              <h3 className="text-lg font-medium text-gray-900">Edit Aircraft</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowEditAircraftModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateAircraft}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Aircraft'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Call Sign</label>
                    <input
                      type="text"
                      value={aircraftFormData.callSign}
                      onChange={e => handleAircraftFormChange('callSign', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <input
                      type="text"
                      value={aircraftFormData.type}
                      onChange={e => handleAircraftFormChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                      <input
                        type="text"
                        value={aircraftFormData.manufacturer}
                        onChange={e => handleAircraftFormChange('manufacturer', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                      <input
                        type="text"
                        value={aircraftFormData.model}
                        onChange={e => handleAircraftFormChange('model', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base</label>
                    <select
                      value={aircraftFormData.baseId || ''}
                      onChange={e => handleAircraftFormChange('baseId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a base</option>
                      {bases.map(base => (
                        <option key={base.id} value={base.id}>
                          {base.name} ({base.icaoCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aircraft Image</label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAircraftImageUpload(file);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {aircraftFormData.imageUrl && (
                        <div className="w-32 h-32 bg-gray-100 rounded-md overflow-hidden">
                          <img 
                            src={`${API_URL}${aircraftFormData.imageUrl}`} 
                            alt="Aircraft preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={aircraftFormData.description}
                      onChange={e => handleAircraftFormChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Specifications */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Specifications</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
                      <input
                        type="number"
                        value={aircraftFormData.seats}
                        onChange={e => handleAircraftFormChange('seats', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year Manufactured</label>
                      <input
                        type="number"
                        value={aircraftFormData.yearManufactured}
                        onChange={e => handleAircraftFormChange('yearManufactured', parseInt(e.target.value) || new Date().getFullYear())}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Flight Hours</label>
                    <input
                      type="number"
                      value={aircraftFormData.totalFlightHours}
                      onChange={e => handleAircraftFormChange('totalFlightHours', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Range (nm)</label>
                      <input
                        type="number"
                        value={aircraftFormData.maxRange}
                        onChange={e => handleAircraftFormChange('maxRange', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cruise Speed (kts)</label>
                      <input
                        type="number"
                        value={aircraftFormData.cruiseSpeed}
                        onChange={e => handleAircraftFormChange('cruiseSpeed', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Capacity (L)</label>
                    <input
                      type="number"
                      value={aircraftFormData.fuelCapacity}
                      onChange={e => handleAircraftFormChange('fuelCapacity', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={aircraftFormData.isActive}
                        onChange={e => handleAircraftFormChange('isActive', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active Aircraft</span>
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

export default FleetManagement; 