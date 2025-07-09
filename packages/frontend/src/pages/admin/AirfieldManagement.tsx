import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Upload, X, Search, Filter, Download, MapPin, CheckCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Use relative URLs for API requests - the worker will proxy them
const API_URL = '';

interface AirfieldManagementProps {
  userRole?: 'admin' | 'user' | 'super_admin' | 'base_manager' | 'instructor';
}

interface OperationalArea {
  id: string;
  type: 'continent' | 'country';
  code: string;
  name: string;
  parent_id?: string;
  is_active: boolean;
  countries?: OperationalArea[]; // Countries nested under continents
}

interface ImportedAirfield {
  id: string;
  our_airports_id: number;
  name: string;
  icao_code?: string;
  iata_code?: string;
  type: 'airport' | 'heliport' | 'seaplane_base' | 'closed';
  latitude?: number;
  longitude?: number;
  elevation_ft?: number;
  continent: string;
  country_code: string;
  country_name: string;
  region_code?: string;
  region_name?: string;
  municipality?: string;
  scheduled_service: boolean;
  is_base: boolean | number; // Handle both boolean and numeric values for backward compatibility
  base_name?: string;
  base_description?: string;
  base_manager?: string;
  base_notes?: string;
}

interface ImportJob {
  id: string;
  job_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  total_records: number;
  processed_records: number;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

const AirfieldManagement: React.FC<AirfieldManagementProps> = ({ userRole = 'user' }) => {
  console.log('AirfieldManagement component rendering with role:', userRole);
  
  // Determine if user has superadmin privileges
  const isSuperadmin = userRole === 'super_admin';
  
  if (!isSuperadmin) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600">Only superadmins can access airfield management.</p>
      </div>
    );
  }

  // State management
  const [operationalAreas, setOperationalAreas] = useState<OperationalArea[]>([]);
  const [selectedContinents, setSelectedContinents] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [airfields, setAirfields] = useState<ImportedAirfield[]>([]);
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [importing, setImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterIsBase, setFilterIsBase] = useState<boolean | null>(null);
  
  // Selection state
  const [selectedAirfieldIds, setSelectedAirfieldIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  // Modal states
  const [showImportModal, setShowImportModal] = useState(false);
  const [showViewAirfieldModal, setShowViewAirfieldModal] = useState(false);
  const [showEditAirfieldModal, setShowEditAirfieldModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAirfield, setSelectedAirfield] = useState<ImportedAirfield | null>(null);
  const [updatingAirfield, setUpdatingAirfield] = useState(false);
  const [baseFormData, setBaseFormData] = useState({
    baseName: '',
    description: '',
    baseManager: '',
    notes: ''
  });

  // Form data for import modal
  const [importFormData, setImportFormData] = useState({
    selectedContinents: [] as string[],
    selectedCountries: [] as string[],
    importHeliports: false,
    importSeaplaneBase: false,
    importBalloonports: false,
    importClosed: false,
  });

  // Form data for edit modal
  const [editFormData, setEditFormData] = useState({
    baseDescription: '',
    baseManager: '',
    baseNotes: '',
    isBase: false
  });

  // Fetch operational areas
  const fetchOperationalAreas = async () => {
    try {
      setLoadingAreas(true);
      const response = await fetch(`${API_URL}/api/superadmin/operational-areas`);
      if (!response.ok) {
        throw new Error('Failed to fetch operational areas');
      }
      const data = await response.json() as OperationalArea[];
      setOperationalAreas(data);
    } catch (error) {
      console.error('Error fetching operational areas:', error);
      toast.error('Failed to load operational areas');
    } finally {
      setLoadingAreas(false);
    }
  };

  // Fetch airfields
  const fetchAirfields = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterCountry) params.append('country', filterCountry);
      if (filterType) params.append('type', filterType);
      if (filterIsBase !== null) params.append('is_base', filterIsBase.toString());

      const url = `${API_URL}/api/superadmin/airfields?${params}`;
      console.log('🔍 Fetching airfields from:', url);
      
      const response = await fetch(url);
      console.log('🔍 Airfields response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch airfields');
      }
      
      const data = await response.json() as ImportedAirfield[];
      console.log('🔍 Airfields API Response:', {
        count: data.length,
        sample: data[0],
        allData: data
      });
      
      setAirfields(data);
    } catch (error) {
      console.error('Error fetching airfields:', error);
      toast.error('Failed to load airfields');
    } finally {
      setLoading(false);
    }
  };

  // Fetch import jobs
  const fetchImportJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/superadmin/import-jobs`);
      if (!response.ok) {
        throw new Error('Failed to fetch import jobs');
      }
      const data = await response.json() as ImportJob[];
      setImportJobs(data);
    } catch (error) {
      console.error('Error fetching import jobs:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchOperationalAreas();
    fetchAirfields();
    fetchImportJobs();
  }, []);

  // Refetch airfields when filters change
  useEffect(() => {
    fetchAirfields();
  }, [searchTerm, filterCountry, filterType, filterIsBase]);

  // Import airfields
  const handleImportAirfields = async () => {
    if (selectedCountries.length === 0) {
      toast.error('Please select at least one country');
      return;
    }

    setImporting(true);
    try {
      // Convert country IDs to country codes from hierarchical structure
      const countryCodes = selectedCountries.map(countryId => {
        for (const continent of operationalAreas) {
          if (continent.countries && Array.isArray(continent.countries)) {
            const country = continent.countries.find(c => c.id === countryId);
            if (country) {
              return country.code;
            }
          }
        }
        return null;
      }).filter(Boolean);

      // Always import all airports
      const types: string[] = ['airport', 'small_airport', 'medium_airport', 'large_airport'];
      if (importFormData.importHeliports) types.push('heliport');
      if (importFormData.importSeaplaneBase) types.push('seaplane_base');
      if (importFormData.importBalloonports) types.push('balloonport');
      if (importFormData.importClosed) types.push('closed');

      const response = await fetch(`${API_URL}/api/superadmin/airfields/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          countryCodes: countryCodes,
          types: types
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to import airfields');
      }

      toast.success('Airfields import started!');
      setShowImportModal(false);
      fetchImportJobs();
      fetchAirfields();
    } catch (error) {
      toast.error('Failed to import airfields');
    } finally {
      setImporting(false);
    }
  };

  // Toggle base designation
  const handleToggleBase = async (airfield: ImportedAirfield, isBase: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/superadmin/bases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          airfieldId: airfield.id,
          airfieldName: airfield.name,
          isBase: isBase,
          baseDescription: '',
          baseManager: '',
          baseNotes: ''
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isBase ? 'create' : 'remove'} base designation`);
      }
      
      toast.success(`Base designation ${isBase ? 'created' : 'removed'} successfully`);
      fetchAirfields();
    } catch (error) {
      console.error('Error toggling base designation:', error);
      toast.error(`Failed to ${isBase ? 'create' : 'remove'} base designation`);
    }
  };

  // Handle continent selection
  const handleContinentToggle = (continentId: string) => {
    setSelectedContinents(prev => 
      prev.includes(continentId) 
        ? prev.filter(id => id !== continentId)
        : [...prev, continentId]
    );
  };

  // Handle country selection
  const handleCountryToggle = (countryId: string) => {
    setSelectedCountries(prev => 
      prev.includes(countryId) 
        ? prev.filter(id => id !== countryId)
        : [...prev, countryId]
    );
  };

  // Get countries for selected continents
  const getCountriesForSelectedContinents = () => {
    // The API returns hierarchical structure with countries nested under continents
    const allCountries: OperationalArea[] = [];
    
    operationalAreas.forEach(area => {
      if (area.type === 'continent' && selectedContinents.includes(area.id)) {
        // Add countries from this continent
        if (area.countries && Array.isArray(area.countries)) {
          allCountries.push(...area.countries);
        }
      }
    });
    
    return allCountries;
  };

  // View airfield handler
  const handleViewAirfield = (airfield: ImportedAirfield) => {
    setSelectedAirfield(airfield);
    setShowViewAirfieldModal(true);
  };

  // Edit airfield handler
  const handleEditAirfield = (airfield: ImportedAirfield) => {
    setSelectedAirfield(airfield);
    setEditFormData({
      baseDescription: airfield.base_description || '',
      baseManager: airfield.base_manager || '',
      baseNotes: airfield.base_notes || '',
      isBase: Boolean(airfield.is_base)
    });
    setShowEditAirfieldModal(true);
  };

  // Update airfield handler
  const handleUpdateAirfield = async () => {
    if (!selectedAirfield) return;
    
    setUpdatingAirfield(true);
    try {
      const response = await fetch(`${API_URL}/api/superadmin/bases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          airfieldId: selectedAirfield.id,
          airfieldName: selectedAirfield.name,
          ...editFormData
        }),
      });

      if (response.ok) {
        setShowEditAirfieldModal(false);
        setSelectedAirfield(null);
        setEditFormData({
          baseDescription: '',
          baseManager: '',
          baseNotes: '',
          isBase: false
        });
        toast.success('Airfield updated successfully!');
        fetchAirfields();
      } else {
        toast.error('Failed to update airfield. Please try again.');
      }
    } catch (error) {
      toast.error('Error updating airfield. Please try again.');
    } finally {
      setUpdatingAirfield(false);
    }
  };

  // Filter and search airfields
  const filteredAirfields = airfields.filter(airfield => {
    const matchesSearch = airfield.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         airfield.icao_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         airfield.iata_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         airfield.municipality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         airfield.country_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || airfield.type === filterType;
    const matchesCountry = !filterCountry || airfield.country_code === filterCountry;
    
    // Remove client-side base filtering since we're doing server-side filtering
    // const matchesIsBase = filterIsBase === null || airfield.is_base === filterIsBase;
    
    return matchesSearch && matchesType && matchesCountry;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'airport': return 'bg-blue-100 text-blue-800';
      case 'heliport': return 'bg-green-100 text-green-800';
      case 'seaplane_base': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBaseStatusColor = (isBase: boolean) => {
    return isBase ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const handleEditFormChange = (field: string, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Selection functions
  const handleSelectAirfield = (airfieldId: string, checked: boolean) => {
    setSelectedAirfieldIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(airfieldId);
      } else {
        newSet.delete(airfieldId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAirfieldIds(new Set(filteredAirfields.map(airfield => airfield.id)));
    } else {
      setSelectedAirfieldIds(new Set());
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedAirfieldIds.size === 0) {
      toast.error('Please select at least one airfield to delete');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedAirfieldIds.size} selected airfield(s)? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      const airfieldIds = Array.from(selectedAirfieldIds);
      
      // Delete each airfield individually
      for (const airfieldId of airfieldIds) {
        const response = await fetch(`${API_URL}/api/superadmin/airfields/${airfieldId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Failed to delete airfield ${airfieldId}`);
        }
      }

      toast.success(`Successfully deleted ${airfieldIds.length} airfield(s)`);
      setSelectedAirfieldIds(new Set());
      fetchAirfields(); // Refresh the list
    } catch (error) {
      console.error('Error deleting airfields:', error);
      toast.error('Failed to delete selected airfields');
    } finally {
      setDeleting(false);
    }
  };

  // Check if all filtered airfields are selected
  const allSelected = filteredAirfields.length > 0 && selectedAirfieldIds.size === filteredAirfields.length;
  const someSelected = selectedAirfieldIds.size > 0 && selectedAirfieldIds.size < filteredAirfields.length;

  return (
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Airfields & Bases</h2>
            <p className="text-sm text-gray-600 mt-1">Import and manage operational airfields</p>
          </div>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Import Airfields
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto py-6 px-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search airfields..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Countries</option>
                {Array.from(new Set(airfields.map(airfield => airfield.country_code)))
                  .sort()
                  .map(countryCode => {
                    const airfield = airfields.find(a => a.country_code === countryCode);
                    return (
                      <option key={countryCode} value={countryCode}>
                        {airfield?.country_name || countryCode}
                      </option>
                    );
                  })}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="airport">Airport</option>
                <option value="heliport">Heliport</option>
                <option value="seaplane_base">Seaplane Base</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Status</label>
              <select
                value={filterIsBase === null ? '' : filterIsBase.toString()}
                onChange={(e) => setFilterIsBase(e.target.value === '' ? null : e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Airfields</option>
                <option value="true">Bases Only</option>
                <option value="false">Non-Bases Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Airfields Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Imported Airfields ({filteredAirfields.length})
            </h3>
            {selectedAirfieldIds.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Selected ({selectedAirfieldIds.size})
                  </>
                )}
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading airfields...</p>
            </div>
          ) : airfields.length === 0 ? (
            <div className="p-6 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No airfields found. Import some airfields to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = someSelected;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Airfield
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAirfields.map((airfield) => (
                    <tr key={airfield.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedAirfieldIds.has(airfield.id)}
                          onChange={(e) => handleSelectAirfield(airfield.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-gray-900">{airfield.name}</div>
                              {Boolean(airfield.is_base) && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Base
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {airfield.icao_code && `ICAO: ${airfield.icao_code}`}
                              {airfield.icao_code && airfield.iata_code && ' • '}
                              {airfield.iata_code && `IATA: ${airfield.iata_code}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{airfield.municipality}</div>
                        <div className="text-sm text-gray-500">{airfield.country_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(airfield.type)}`}>
                          {airfield.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewAirfield(airfield)}
                            className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditAirfield(airfield)}
                            className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Import Airfields</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Select Operational Areas</h4>
                
                {/* Continents */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Continents</h5>
                  {loadingAreas ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm text-gray-600">Loading continents...</span>
                    </div>
                  ) : operationalAreas.filter(area => area.type === 'continent').length === 0 ? (
                    <div className="text-center py-4 text-sm text-gray-500">
                      No continents available. Please check your connection.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {operationalAreas
                        .filter(area => area.type === 'continent')
                        .map(continent => (
                          <label key={continent.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedContinents.includes(continent.id)}
                              onChange={() => handleContinentToggle(continent.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">{continent.name}</span>
                          </label>
                        ))}
                    </div>
                  )}
                </div>
                
                {/* Countries */}
                {selectedContinents.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Countries ({getCountriesForSelectedContinents().length} found)
                    </h5>
                    {getCountriesForSelectedContinents().length === 0 ? (
                      <div className="text-center py-4 text-sm text-gray-500 border border-gray-200 rounded-md bg-gray-50">
                        <p className="font-medium">No countries found for selected continents.</p>
                        <p className="text-xs mt-1 text-gray-400">
                          Selected: {operationalAreas
                            .filter(area => area.type === 'continent' && selectedContinents.includes(area.id))
                            .map(area => area.name)
                            .join(', ')}
                        </p>
                        <p className="text-xs mt-1 text-gray-400">
                          Total continents: {operationalAreas.filter(area => area.type === 'continent').length} | 
                          Total countries: {operationalAreas.reduce((sum, area) => sum + (area.countries?.length || 0), 0)}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
                        {getCountriesForSelectedContinents().map(country => (
                          <label key={country.id} className="flex items-center hover:bg-gray-50 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={selectedCountries.includes(country.id)}
                              onChange={() => handleCountryToggle(country.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">{country.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Import Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={importFormData.importHeliports}
                      onChange={e => setImportFormData(f => ({ ...f, importHeliports: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Import Heliports</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={importFormData.importSeaplaneBase}
                      onChange={e => setImportFormData(f => ({ ...f, importSeaplaneBase: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Import Seaplane Bases</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={importFormData.importBalloonports}
                      onChange={e => setImportFormData(f => ({ ...f, importBalloonports: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Import Balloonports</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={importFormData.importClosed}
                      onChange={e => setImportFormData(f => ({ ...f, importClosed: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Import Closed Airfields</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportAirfields}
                  disabled={importing || selectedCountries.length === 0}
                  className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                >
                  {importing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Import Airfields
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Airfield Modal */}
      {showViewAirfieldModal && selectedAirfield && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
              <h3 className="text-lg font-medium text-gray-900">Airfield Details</h3>
              <button
                onClick={() => setShowViewAirfieldModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Basic Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <p className="text-sm text-gray-900">{selectedAirfield.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ICAO Code</label>
                      <p className="text-sm text-gray-900">{selectedAirfield.icao_code || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IATA Code</label>
                      <p className="text-sm text-gray-900">{selectedAirfield.iata_code || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedAirfield.type)}`}>
                      {selectedAirfield.type}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <p className="text-sm text-gray-900">{selectedAirfield.municipality}, {selectedAirfield.country_name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                      <p className="text-sm text-gray-900">{selectedAirfield.latitude && selectedAirfield.latitude.toFixed(4)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                      <p className="text-sm text-gray-900">{selectedAirfield.longitude && selectedAirfield.longitude.toFixed(4)}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Elevation</label>
                    <p className="text-sm text-gray-900">{selectedAirfield.elevation_ft ? `${selectedAirfield.elevation_ft} ft` : 'N/A'}</p>
                  </div>
                </div>

                {/* Base Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Base Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBaseStatusColor(Boolean(selectedAirfield.is_base))}`}>
                      {Boolean(selectedAirfield.is_base) ? 'COMPANY BASE' : 'NOT BASE'}
                    </span>
                  </div>

                                      {Boolean(selectedAirfield.is_base) && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <p className="text-sm text-gray-900">{selectedAirfield.base_description || 'N/A'}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Base Manager</label>
                          <p className="text-sm text-gray-900">{selectedAirfield.base_manager || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                          <p className="text-sm text-gray-900">{selectedAirfield.base_notes || 'N/A'}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Airfield Modal */}
      {showEditAirfieldModal && selectedAirfield && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
              <h3 className="text-lg font-medium text-gray-900">Edit Airfield</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowEditAirfieldModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateAirfield}
                  disabled={updatingAirfield}
                  className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {updatingAirfield ? 'Updating...' : 'Update Airfield'}
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Read-only Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Imported Information (Read-only)</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border">{selectedAirfield.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ICAO Code</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border">{selectedAirfield.icao_code || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IATA Code</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border">{selectedAirfield.iata_code || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedAirfield.type)}`}>
                      {selectedAirfield.type}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border">{selectedAirfield.municipality}, {selectedAirfield.country_name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border">{selectedAirfield.latitude && selectedAirfield.latitude.toFixed(4)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border">{selectedAirfield.longitude && selectedAirfield.longitude.toFixed(4)}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Elevation</label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border">{selectedAirfield.elevation_ft ? `${selectedAirfield.elevation_ft} ft` : 'N/A'}</p>
                  </div>
                </div>

                {/* Editable Base Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Base Configuration</h4>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isBase"
                      checked={editFormData.isBase}
                      onChange={(e) => handleEditFormChange('isBase', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isBase" className="ml-2 text-sm font-medium text-gray-700">
                      Designate as Company Base
                    </label>
                  </div>

                  {editFormData.isBase && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={editFormData.baseDescription}
                          onChange={(e) => handleEditFormChange('baseDescription', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter base description"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Base Manager</label>
                          <input
                            type="text"
                            value={editFormData.baseManager}
                            onChange={(e) => handleEditFormChange('baseManager', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Base manager name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                          <input
                            type="text"
                            value={editFormData.baseNotes}
                            onChange={(e) => handleEditFormChange('baseNotes', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Additional notes"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AirfieldManagement; 