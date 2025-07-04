import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, Plane } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ServiceManagementProps {
  userRole?: 'admin' | 'user' | 'super_admin' | 'base_manager';
}

const ServiceManagement: React.FC<ServiceManagementProps> = ({ userRole = 'user' }) => {
  console.log('ServiceManagement component rendering with role:', userRole);
  
  // Determine if user has admin privileges for service management
  const isAdmin = userRole === 'admin' || userRole === 'super_admin' || userRole === 'base_manager';
  
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showViewServiceModal, setShowViewServiceModal] = useState(false);
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    description: '',
    type: 'flight_school',
    basePrice: 0,
    duration: '',
    defaultPaymentPlan: 'full_price',
    isActive: true,
    imageUrl: ''
  });

  // Services data from API
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch services from API
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/admin/services`);
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      const data = await response.json();
      setServices(data as any[]);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Load services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  const serviceTypes = [
    { value: 'flight_school', label: 'Flight School' },
    { value: 'aircraft_rental', label: 'Aircraft Rental' },
    { value: 'instruction', label: 'Instruction' },
    { value: 'exam_preparation', label: 'Exam Preparation' },
    { value: 'theoretical_course', label: 'Theoretical Course' }
  ];

  const paymentPlans = [
    { value: 'full_price', label: 'Full Price' },
    { value: 'two_installments', label: 'Two Installments' },
    { value: 'full_payment', label: 'Full Payment' }
  ];

  const handleServiceFormChange = (field: string, value: any) => {
    setServiceFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateService = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceFormData),
      });

      if (!response.ok) {
        throw new Error('Failed to create service');
      }

      const newService = await response.json();
      setServices(prev => [...prev, newService]);
      setShowAddServiceModal(false);
      setServiceFormData({
        name: '',
        description: '',
        type: 'flight_school',
        basePrice: 0,
        duration: '',
        defaultPaymentPlan: 'full_price',
        isActive: true,
        imageUrl: ''
      });
      alert('Service created successfully!');
    } catch (error) {
      console.error('Error creating service:', error);
      alert('Error creating service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewService = (service: any) => {
    setSelectedService(service);
    setShowViewServiceModal(true);
  };

  const handleEditService = (service: any) => {
    setSelectedService(service);
    setServiceFormData({
      name: service.name || '',
      description: service.description || '',
      type: service.type || 'flight_school',
      basePrice: service.basePrice || 0,
      duration: service.duration || '',
      defaultPaymentPlan: service.defaultPaymentPlan || 'full_price',
      isActive: service.isActive,
      imageUrl: service.imageUrl || ''
    });
    setShowEditServiceModal(true);
  };

  const handleUpdateService = async () => {
    if (!selectedService) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/services/${selectedService.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceFormData),
      });

      if (!response.ok) {
        throw new Error('Failed to update service');
      }

      const updatedService = await response.json();
      setServices(prev => prev.map(service => 
        service.id === selectedService.id 
          ? updatedService
          : service
      ));
      setShowEditServiceModal(false);
      setSelectedService(null);
      setServiceFormData({
        name: '',
        description: '',
        type: 'flight_school',
        basePrice: 0,
        duration: '',
        defaultPaymentPlan: 'full_price',
        isActive: true,
        imageUrl: ''
      });
      alert('Service updated successfully!');
    } catch (error) {
      console.error('Error updating service:', error);
      alert('Error updating service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async (service: any) => {
    if (!confirm(`Are you sure you want to delete "${service.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/services/${service.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete service');
      }

      setServices(prev => prev.filter(s => s.id !== service.id));
      alert('Service deleted successfully!');
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Error deleting service. Please try again.');
    }
  };

  const handleServiceImageUpload = async (file: File) => {
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
      formData.append('file', file);
      
      console.log('Uploading service image:', file.name, 'Size:', file.size);
      
      const response = await fetch(`${API_URL}/api/admin/services/upload-image`, {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (response.ok) {
        const data = await response.json() as { url: string };
        console.log('Upload success:', data);
        handleServiceFormChange('imageUrl', data.url);
        alert('Service image uploaded successfully!');
      } else {
        const errorData = await response.text();
        console.error('Upload failed:', errorData);
        alert(`Failed to upload service image: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading service image. Please check your connection and try again.');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'flight_school': return 'bg-blue-100 text-blue-800';
      case 'aircraft_rental': return 'bg-green-100 text-green-800';
      case 'instruction': return 'bg-yellow-100 text-yellow-800';
      case 'exam_preparation': return 'bg-purple-100 text-purple-800';
      case 'theoretical_course': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    return serviceTypes.find(t => t.value === type)?.label || type;
  };

  try {
    return (
      <div className="h-full flex flex-col">
      {/* Header Section - Fixed at top */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Service Management' : 'Available Services'}
          </h2>
          {isAdmin && (
            <button
              onClick={() => setShowAddServiceModal(true)}
              className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800"
            >
              Add Service
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto py-6 px-0">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading services...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error: {error}</p>
              <button
                onClick={fetchServices}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Services Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col min-h-[400px]">
                {/* Image Section - 16:9 Aspect Ratio */}
                <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                  {service.imageUrl ? (
                    <img 
                      src={`${API_URL}${service.imageUrl}`} 
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Plane className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  {/* Status Badge Overlay */}
                  <div className="absolute top-3 right-3">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {service.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{service.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">{getTypeLabel(service.type)}</p>
                    <p className="text-lg font-bold text-gray-900 mb-3">€{service.basePrice}</p>
                    
                    <div className="mb-3">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(service.type)}`}>
                        {getTypeLabel(service.type).toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                  </div>
                  
                  {/* Action Links */}
                  <div className="border-t border-gray-200 pt-3 mt-4">
                    <div className="flex space-x-3 text-sm">
                      <button
                        onClick={() => handleViewService(service)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleEditService(service)}
                            className="text-gray-600 hover:text-gray-800 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteService(service)}
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

      {/* Add Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
              <h3 className="text-lg font-medium text-gray-900">Add New Service</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowAddServiceModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateService}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Service'}
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                    <input
                      type="text"
                      value={serviceFormData.name}
                      onChange={e => handleServiceFormChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Private Pilot License Training"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={serviceFormData.description}
                      onChange={e => handleServiceFormChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Description of the service..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Image</label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleServiceImageUpload(file);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {serviceFormData.imageUrl && (
                        <div className="w-32 h-32 bg-gray-100 rounded-md overflow-hidden">
                          <img 
                            src={`${API_URL}${serviceFormData.imageUrl}`} 
                            alt="Service preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                      <select
                        value={serviceFormData.type}
                        onChange={e => handleServiceFormChange('type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {serviceTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Plan</label>
                      <select
                        value={serviceFormData.defaultPaymentPlan}
                        onChange={e => handleServiceFormChange('defaultPaymentPlan', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {paymentPlans.map(plan => (
                          <option key={plan.value} value={plan.value}>
                            {plan.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (€)</label>
                      <input
                        type="number"
                        value={serviceFormData.basePrice}
                        onChange={e => handleServiceFormChange('basePrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="8500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <input
                        type="text"
                        value={serviceFormData.duration}
                        onChange={e => handleServiceFormChange('duration', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="40-60 hours"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={serviceFormData.isActive}
                        onChange={e => handleServiceFormChange('isActive', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active Service</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Service Modal */}
      {showViewServiceModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
              <h3 className="text-lg font-medium text-gray-900">View Service</h3>
              <button
                onClick={() => setShowViewServiceModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Service Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {selectedService.imageUrl ? (
                      <img 
                        src={`${API_URL}${selectedService.imageUrl}`} 
                        alt={selectedService.name} 
                        className="w-16 h-16 object-cover"
                      />
                    ) : (
                      <Plane className="w-8 h-8 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{selectedService.name}</h4>
                    <p className="text-gray-500">{getTypeLabel(selectedService.type)}</p>
                    <div className="flex space-x-2 mt-2">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(selectedService.type)}`}>
                        {getTypeLabel(selectedService.type).toUpperCase()}
                      </span>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${selectedService.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {selectedService.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Service Information</h5>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">€{selectedService.basePrice}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{selectedService.duration || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Plan</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{selectedService.defaultPaymentPlan || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Description</h5>
                    <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded">{selectedService.description || 'No description available'}</p>
                  </div>
                </div>

                {/* Service Image */}
                {selectedService.imageUrl && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Service Image</h5>
                    <div className="w-full max-w-md bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={`${API_URL}${selectedService.imageUrl}`} 
                        alt={selectedService.name} 
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

      {/* Edit Service Modal */}
      {showEditServiceModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
              <h3 className="text-lg font-medium text-gray-900">Edit Service</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowEditServiceModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateService}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Service'}
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                    <input
                      type="text"
                      value={serviceFormData.name}
                      onChange={e => handleServiceFormChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Private Pilot License Training"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={serviceFormData.description}
                      onChange={e => handleServiceFormChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Description of the service..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Image</label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleServiceImageUpload(file);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {serviceFormData.imageUrl && (
                        <div className="w-32 h-32 bg-gray-100 rounded-md overflow-hidden">
                          <img 
                            src={`${API_URL}${serviceFormData.imageUrl}`} 
                            alt="Service preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                      <select
                        value={serviceFormData.type}
                        onChange={e => handleServiceFormChange('type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {serviceTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Plan</label>
                      <select
                        value={serviceFormData.defaultPaymentPlan}
                        onChange={e => handleServiceFormChange('defaultPaymentPlan', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {paymentPlans.map(plan => (
                          <option key={plan.value} value={plan.value}>
                            {plan.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (€)</label>
                      <input
                        type="number"
                        value={serviceFormData.basePrice}
                        onChange={e => handleServiceFormChange('basePrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="8500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <input
                        type="text"
                        value={serviceFormData.duration}
                        onChange={e => handleServiceFormChange('duration', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="40-60 hours"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={serviceFormData.isActive}
                        onChange={e => handleServiceFormChange('isActive', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active Service</span>
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
  } catch (error) {
    console.error('Error rendering ServiceManagement:', error);
    return (
      <div className="h-full flex flex-col">
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-2xl font-bold text-gray-900">Service Management</h2>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Services</h3>
            <p className="text-gray-600">There was an error loading the service management section.</p>
          </div>
        </div>
      </div>
    );
  }
};

export default ServiceManagement; 