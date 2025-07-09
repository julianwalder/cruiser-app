import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, MapPin, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Use relative URLs for API requests - the worker will proxy them
const API_URL = '';

interface BaseManagementProps {
  userRole?: 'admin' | 'user' | 'super_admin' | 'base_manager' | 'instructor';
}

interface DesignatedAirfield {
  id: string;
  name: string;
  icao_code: string | null;
  iata_code: string | null;
  type: string;
  latitude: number;
  longitude: number;
  elevation_ft: number | null;
  continent: string;
  country_code: string;
  country_name: string;
  region_code: string | null;
  region_name: string | null;
  municipality: string | null;
  scheduled_service: boolean;
  is_base: number;
  base_name: string | null;
  base_description: string | null;
  base_manager: string | null;
  base_notes: string | null;
  created_at: string;
  updated_at: string;
}

const BaseManagement: React.FC<BaseManagementProps> = ({ userRole = 'user' }) => {
  console.log('BaseManagement component rendering with role:', userRole);
  
  // Determine if user has admin privileges for base management
  const isAdmin = userRole === 'admin' || userRole === 'super_admin' || userRole === 'base_manager' || userRole === 'instructor';
  
  const [showBaseModal, setShowBaseModal] = useState(false);
  const [showViewBaseModal, setShowViewBaseModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBase, setSelectedBase] = useState<DesignatedAirfield | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [baseFormData, setBaseFormData] = useState({
    baseName: '',
    baseDescription: '',
    baseManager: '',
    baseNotes: ''
  });

  // Designated airfields data from API
  const [designatedAirfields, setDesignatedAirfields] = useState<DesignatedAirfield[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch designated airfields from API
  const fetchDesignatedAirfields = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/superadmin/airfields?isBase=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch designated airfields');
      }
      const data = await response.json();
      setDesignatedAirfields(data as DesignatedAirfield[]);
    } catch (err) {
      console.error('Error fetching designated airfields:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Load designated airfields on component mount
  useEffect(() => {
    fetchDesignatedAirfields();
  }, []);

  const handleBaseFormChange = (field: string, value: any) => {
    setBaseFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setBaseFormData({
      baseName: '',
      baseDescription: '',
      baseManager: '',
      baseNotes: ''
    });
  };

  const handleUpdateBase = async () => {
    if (!selectedBase) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/superadmin/bases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          airfieldId: selectedBase.id,
          airfieldName: selectedBase.name,
          isBase: true,
          baseName: baseFormData.baseName,
          baseDescription: baseFormData.baseDescription,
          baseManager: baseFormData.baseManager,
          baseNotes: baseFormData.baseNotes
        }),
      });

      if (response.ok) {
        await fetchDesignatedAirfields(); // Refresh the list
        setShowBaseModal(false);
        resetForm();
        setSelectedBase(null);
        toast.success('Base designation updated successfully!');
      } else {
        throw new Error('Failed to update base designation');
      }
    } catch (error) {
      console.error('Error updating base designation:', error);
      toast.error('Error updating base designation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewBase = (airfield: DesignatedAirfield) => {
    setSelectedBase(airfield);
    setShowViewBaseModal(true);
  };

  const handleEditBase = (airfield: DesignatedAirfield) => {
    setSelectedBase(airfield);
    setBaseFormData({
      baseName: airfield.base_name || airfield.name,
      baseDescription: airfield.base_description || '',
      baseManager: airfield.base_manager || '',
      baseNotes: airfield.base_notes || ''
    });
    setIsEditMode(true);
    setShowBaseModal(true);
  };

  const handleAddBase = () => {
    setIsEditMode(false);
    resetForm();
    setSelectedBase(null);
    setShowBaseModal(true);
  };

  const handleRemoveBaseDesignation = async (airfield: DesignatedAirfield) => {
    if (!confirm(`Are you sure you want to remove the base designation for "${airfield.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/superadmin/bases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          airfieldId: airfield.id,
          isBase: false
        }),
      });

      if (response.ok) {
        await fetchDesignatedAirfields(); // Refresh the list
        toast.success('Base designation removed successfully!');
      } else {
        throw new Error('Failed to remove base designation');
      }
    } catch (error) {
      console.error('Error removing base designation:', error);
      toast.error('Error removing base designation. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading designated airfields...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={fetchDesignatedAirfields}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header Section - Fixed at top */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Base Management' : 'Company Bases'}
          </h2>
          {isAdmin && (
            <button
              onClick={handleAddBase}
              className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800"
            >
              Add Base
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto py-6 px-6">
        {designatedAirfields.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Bases Designated</h3>
            <p className="text-gray-600 mb-6">
              {isAdmin 
                ? "No airfields have been designated as company bases yet. Use the 'Add Base' button to designate airfields as bases."
                : "No company bases are currently available."
              }
            </p>
            {isAdmin && (
              <button
                onClick={handleAddBase}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Designate First Base
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Company Bases</h3>
                    <p className="text-sm text-gray-600">
                      {designatedAirfields.length} airfield{designatedAirfields.length !== 1 ? 's' : ''} designated as company bases
                    </p>
                  </div>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bases Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designatedAirfields.map((airfield) => (
                <div key={airfield.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col min-h-[400px]">
                  {/* Image Section - 16:9 Aspect Ratio */}
                  <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-blue-600 font-medium">Airfield Base</p>
                      </div>
                    </div>
                    {/* Base Badge Overlay */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Company Base
                      </span>
                    </div>
                    {/* Type Badge Overlay */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                        {airfield.type}
                      </span>
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        {airfield.base_name || airfield.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {airfield.municipality || airfield.region_name}, {airfield.country_name}
                      </p>
                      <div className="space-y-1 text-xs text-gray-400">
                        {airfield.icao_code && (
                          <p>ICAO: {airfield.icao_code}</p>
                        )}
                        {airfield.iata_code && (
                          <p>IATA: {airfield.iata_code}</p>
                        )}
                        {airfield.elevation_ft && (
                          <p>Elevation: {airfield.elevation_ft} ft</p>
                        )}
                      </div>
                      {airfield.base_description && (
                        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                          {airfield.base_description}
                        </p>
                      )}
                    </div>
                    
                    {/* Action Links */}
                    <div className="border-t border-gray-200 pt-3 mt-4">
                      <div className="flex space-x-3 text-sm">
                        <button
                          onClick={() => handleViewBase(airfield)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleEditBase(airfield)}
                              className="text-gray-600 hover:text-gray-800 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleRemoveBaseDesignation(airfield)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Remove Base
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Base Modal */}
      {showBaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditMode ? 'Edit Base Designation' : 'Designate New Base'}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowBaseModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateBase}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Base' : 'Designate Base')}
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Name</label>
                  <input
                    type="text"
                    value={baseFormData.baseName}
                    onChange={e => handleBaseFormChange('baseName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter base name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={baseFormData.baseDescription}
                    onChange={e => handleBaseFormChange('baseDescription', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Description of the base..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Manager</label>
                  <input
                    type="text"
                    value={baseFormData.baseManager}
                    onChange={e => handleBaseFormChange('baseManager', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Base manager name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={baseFormData.baseNotes}
                    onChange={e => handleBaseFormChange('baseNotes', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes..."
                  />
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
              <h3 className="text-lg font-medium text-gray-900">
                Base Details: {selectedBase.base_name || selectedBase.name}
              </h3>
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
                {/* Basic Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Airfield Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="text-sm text-gray-900">{selectedBase.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <p className="text-sm text-gray-900 capitalize">{selectedBase.type}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ICAO Code</label>
                      <p className="text-sm text-gray-900">{selectedBase.icao_code || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">IATA Code</label>
                      <p className="text-sm text-gray-900">{selectedBase.iata_code || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <p className="text-sm text-gray-900">
                        {selectedBase.municipality || selectedBase.region_name}, {selectedBase.country_name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Elevation</label>
                      <p className="text-sm text-gray-900">
                        {selectedBase.elevation_ft ? `${selectedBase.elevation_ft} ft` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Coordinates</label>
                      <p className="text-sm text-gray-900">
                        {selectedBase.latitude.toFixed(6)}, {selectedBase.longitude.toFixed(6)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Scheduled Service</label>
                      <p className="text-sm text-gray-900">
                        {selectedBase.scheduled_service ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Base Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Base Information</h4>
                  <div className="space-y-3">
                    {selectedBase.base_name && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Base Name</label>
                        <p className="text-sm text-gray-900">{selectedBase.base_name}</p>
                      </div>
                    )}
                    {selectedBase.base_description && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <p className="text-sm text-gray-900">{selectedBase.base_description}</p>
                      </div>
                    )}
                    {selectedBase.base_manager && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Base Manager</label>
                        <p className="text-sm text-gray-900">{selectedBase.base_manager}</p>
                      </div>
                    )}
                    {selectedBase.base_notes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <p className="text-sm text-gray-900">{selectedBase.base_notes}</p>
                      </div>
                    )}
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