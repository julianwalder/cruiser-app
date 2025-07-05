import toast from 'react-hot-toast';

/**
 * Reusable patterns for admin management components
 * This file contains common patterns to ensure consistency across all admin components
 */

// Toast notification patterns
export const toastPatterns = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  loading: (message: string) => toast.loading(message),
  dismiss: () => toast.dismiss(),
};

// Common validation patterns
export const validationPatterns = {
  imageFile: (file: File, maxSizeMB: number = 5) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return false;
    }
    
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Image file size must be less than ${maxSizeMB}MB.`);
      return false;
    }
    
    return true;
  },
  
  required: (value: any, fieldName: string) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      toast.error(`${fieldName} is required.`);
      return false;
    }
    return true;
  },
  
  email: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      return false;
    }
    return true;
  },
  
  number: (value: any, fieldName: string, min?: number, max?: number) => {
    const num = Number(value);
    if (isNaN(num)) {
      toast.error(`${fieldName} must be a valid number.`);
      return false;
    }
    
    if (min !== undefined && num < min) {
      toast.error(`${fieldName} must be at least ${min}.`);
      return false;
    }
    
    if (max !== undefined && num > max) {
      toast.error(`${fieldName} must be no more than ${max}.`);
      return false;
    }
    
    return true;
  }
};

// Common API patterns
export const apiPatterns = {
  handleResponse: async (response: Response, successMessage: string, errorContext: string) => {
    if (response.ok) {
      const data = await response.json();
      toast.success(successMessage);
      return { success: true, data };
    } else {
      const errorData = await response.text();
      console.error(`Failed to ${errorContext}:`, errorData);
      toast.error(`Error ${errorContext}. Please try again.`);
      return { success: false, error: errorData };
    }
  },
  
  handleError: (error: any, errorContext: string) => {
    console.error(`Error ${errorContext}:`, error);
    toast.error(`Error ${errorContext}. Please try again.`);
    return { success: false, error };
  },
  
  uploadImage: async (file: File, endpoint: string, apiUrl: string = '') => {
    try {
      if (!validationPatterns.imageFile(file)) {
        return { success: false };
      }

      const formData = new FormData();
      formData.append('image', file);
      
      console.log('Uploading image:', file.name, 'Size:', file.size);
      
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Upload success:', data);
        toast.success('Image uploaded successfully!');
        return { success: true, data };
      } else {
        const errorData = await response.text();
        console.error('Upload failed:', errorData);
        toast.error(`Failed to upload image: ${response.status} ${response.statusText}`);
        return { success: false, error: errorData };
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading image. Please check your connection and try again.');
      return { success: false, error };
    }
  }
};

// Common modal patterns
export const modalPatterns = {
  // Modal state management
  createModalState: () => ({
    showModal: false,
    modalMode: 'add' as 'add' | 'edit',
    selectedItem: null,
    isSubmitting: false
  }),
  
  // Form reset pattern
  createFormReset: (defaultFormData: any) => () => defaultFormData,
  
  // Modal handlers
  createModalHandlers: (setState: any) => ({
    openAdd: (resetForm: () => void) => {
      resetForm();
      setState((prev: any) => ({
        ...prev,
        showModal: true,
        modalMode: 'add',
        selectedItem: null
      }));
    },
    
    openEdit: (item: any, setFormData: (data: any) => void) => {
      setFormData(item);
      setState((prev: any) => ({
        ...prev,
        showModal: true,
        modalMode: 'edit',
        selectedItem: item
      }));
    },
    
    close: () => {
      setState((prev: any) => ({
        ...prev,
        showModal: false,
        selectedItem: null
      }));
    }
  })
};

// Common CRUD patterns
export const crudPatterns = {
  create: async (endpoint: string, data: any, apiUrl: string = '') => {
    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      return apiPatterns.handleResponse(response, 'Item created successfully!', 'creating item');
    } catch (error) {
      return apiPatterns.handleError(error, 'creating item');
    }
  },
  
  update: async (endpoint: string, id: string | number, data: any, apiUrl: string = '') => {
    try {
      const response = await fetch(`${apiUrl}${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      return apiPatterns.handleResponse(response, 'Item updated successfully!', 'updating item');
    } catch (error) {
      return apiPatterns.handleError(error, 'updating item');
    }
  },
  
  delete: async (endpoint: string, id: string | number, apiUrl: string = '') => {
    try {
      const response = await fetch(`${apiUrl}${endpoint}/${id}`, {
        method: 'DELETE',
      });
      
      return apiPatterns.handleResponse(response, 'Item deleted successfully!', 'deleting item');
    } catch (error) {
      return apiPatterns.handleError(error, 'deleting item');
    }
  },
  
  fetch: async (endpoint: string, apiUrl: string = '') => {
    try {
      const response = await fetch(`${apiUrl}${endpoint}`);
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        console.error('Failed to fetch data:', response.status, response.statusText);
        return { success: false, error: `Failed to load data: ${response.status}` };
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return { success: false, error: 'Error connecting to server' };
    }
  }
};

// Common form patterns
export const formPatterns = {
  // Form field change handler
  createFieldHandler: (setFormData: any) => (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  },
  
  // Form validation
  validateForm: (formData: any, requiredFields: string[]) => {
    for (const field of requiredFields) {
      if (!validationPatterns.required(formData[field], field)) {
        return false;
      }
    }
    return true;
  }
};

// Common utility functions
export const utils = {
  // Confirmation dialog
  confirmDelete: (itemName: string) => {
    return confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`);
  },
  
  // Get base name by ID helper
  getBaseNameById: (bases: any[], baseId: string) => {
    const base = bases.find(b => b.id === baseId);
    return base ? `${base.name} (${base.icaoCode})` : 'Unknown Base';
  },
  
  // Get ICAO code by ID helper
  getIcaoCodeById: (bases: any[], baseId: string) => {
    const base = bases.find(b => b.id === baseId);
    return base ? base.icaoCode : 'N/A';
  }
};

// Export all patterns for easy importing
export default {
  toastPatterns,
  validationPatterns,
  apiPatterns,
  modalPatterns,
  crudPatterns,
  formPatterns,
  utils
}; 