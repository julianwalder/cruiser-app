#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8787;

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for large images
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' })); // Increased limit for base64 image data
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Mock data for development
const mockData = {
  services: [
    { 
      id: 1, 
      name: 'Flight Training', 
      description: 'Professional flight instruction',
      type: 'flight_school',
      basePrice: 150,
      duration: '2 hours',
      defaultPaymentPlan: 'full_price',
      isActive: true,
      imageUrl: ''
    },
    { 
      id: 2, 
      name: 'Aircraft Rental', 
      description: 'Hourly aircraft rental',
      type: 'aircraft_rental',
      basePrice: 200,
      duration: '1 hour',
      defaultPaymentPlan: 'full_payment',
      isActive: true,
      imageUrl: ''
    },
    { 
      id: 3, 
      name: 'Maintenance', 
      description: 'Aircraft maintenance services',
      type: 'instruction',
      basePrice: 100,
      duration: '1 hour',
      defaultPaymentPlan: 'full_price',
      isActive: true,
      imageUrl: ''
    }
  ],
  bases: [
    { 
      id: 1, 
      name: 'Main Airport', 
      description: 'Primary aviation facility in the downtown area',
      address: '123 Airport Road',
      city: 'Downtown',
      region: 'Central',
      country: 'USA',
      postalCode: '12345',
      latitude: 40.7128,
      longitude: -74.0060,
      icaoCode: 'MAIN',
      iataCode: 'MNA',
      runwayLength: '8000',
      runwaySurface: 'Asphalt',
      elevation: '13',
      frequency: '118.1',
      operatingHours: '24/7',
      phone: '+1 (555) 123-4567',
      email: 'info@mainairport.com',
      website: 'https://mainairport.com',
      imageUrl: 'https://picsum.photos/400/300?random=1',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    { 
      id: 2, 
      name: 'Regional Field', 
      description: 'Secondary aviation facility in the suburbs',
      address: '456 Aviation Blvd',
      city: 'Suburbs',
      region: 'North',
      country: 'USA',
      postalCode: '67890',
      latitude: 40.7589,
      longitude: -73.9851,
      icaoCode: 'REG',
      iataCode: 'RGF',
      runwayLength: '6000',
      runwaySurface: 'Concrete',
      elevation: '25',
      frequency: '118.3',
      operatingHours: '6AM-10PM',
      phone: '+1 (555) 987-6543',
      email: 'info@regionalfield.com',
      website: 'https://regionalfield.com',
      imageUrl: 'https://picsum.photos/400/300?random=2',
      isActive: true,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    }
  ],
  aircraft: [
    { 
      id: 1, 
      name: 'Cessna 172 Skyhawk', 
      type: 'Single Engine Piston',
      category: 'airplane',
      registration: 'N12345',
      manufacturer: 'Cessna',
      model: '172',
      year: 2015,
      serialNumber: '172-12345',
      totalTime: 1200,
      lastInspection: '2024-01-15T00:00:00Z',
      nextInspection: '2025-01-15T00:00:00Z',
      fuelCapacity: 56,
      maxTakeoffWeight: 2550,
      cruiseSpeed: 120,
      range: 800,
      seats: 4,
      engineType: 'Lycoming O-320',
      engineHours: 1200,
      propellerHours: 1200,
      baseId: 1,
      isActive: true,
      imageUrl: 'https://picsum.photos/400/300?random=3',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    { 
      id: 2, 
      name: 'Piper PA-28R Arrow', 
      type: 'Single Engine Piston',
      category: 'airplane',
      registration: 'N67890',
      manufacturer: 'Piper',
      model: 'PA-28R',
      year: 2018,
      serialNumber: 'PA28-67890',
      totalTime: 800,
      lastInspection: '2024-02-01T00:00:00Z',
      nextInspection: '2025-02-01T00:00:00Z',
      fuelCapacity: 84,
      maxTakeoffWeight: 2750,
      cruiseSpeed: 140,
      range: 1000,
      seats: 4,
      engineType: 'Lycoming IO-360',
      engineHours: 800,
      propellerHours: 800,
      baseId: 1,
      isActive: true,
      imageUrl: 'https://picsum.photos/400/300?random=4',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    }
  ],
  users: [
    { 
      id: 1, 
      email: 'admin@cruiser.com', 
      firstName: 'Admin',
      lastName: 'User',
      name: 'Admin User', 
      role: 'admin',
      status: 'active',
      phoneNumber: '+1 (555) 111-1111',
      createdAt: '2024-01-01T00:00:00Z',
      imageUrl: 'https://picsum.photos/150/150?random=1',
      address: '123 Admin St',
      city: 'Admin City',
      region: 'Admin Region',
      country: 'USA',
      postalCode: '12345',
      nationality: 'American',
      dateOfBirth: '1980-01-01T00:00:00Z',
      nationalId: 'ADMIN123',
      sex: 'M',
      hasPPL: true,
      pplNumber: 'PPL123456',
      pplIssueDate: '2020-01-01T00:00:00Z',
      pplExpiryDate: '2030-01-01T00:00:00Z',
      medicalCertificateNumber: 'MED123456',
      medicalExamDate: '2023-01-01T00:00:00Z',
      medicalIssueDate: '2023-01-01T00:00:00Z',
      medicalExpiryDate: '2025-01-01T00:00:00Z',
      totalFlightHours: 1000,
      creditedHours: 950
    },
    { 
      id: 2, 
      email: 'pilot@cruiser.com', 
      firstName: 'Pilot',
      lastName: 'User',
      name: 'Pilot User', 
      role: 'pilot',
      status: 'active',
      phoneNumber: '+1 (555) 222-2222',
      createdAt: '2024-01-15T00:00:00Z',
      imageUrl: 'https://picsum.photos/150/150?random=2',
      address: '456 Pilot Ave',
      city: 'Pilot City',
      region: 'Pilot Region',
      country: 'USA',
      postalCode: '67890',
      nationality: 'American',
      dateOfBirth: '1985-05-15T00:00:00Z',
      nationalId: 'PILOT456',
      sex: 'F',
      hasPPL: true,
      pplNumber: 'PPL789012',
      pplIssueDate: '2021-06-01T00:00:00Z',
      pplExpiryDate: '2031-06-01T00:00:00Z',
      medicalCertificateNumber: 'MED789012',
      medicalExamDate: '2023-06-01T00:00:00Z',
      medicalIssueDate: '2023-06-01T00:00:00Z',
      medicalExpiryDate: '2025-06-01T00:00:00Z',
      totalFlightHours: 500,
      creditedHours: 480
    },
    {
      id: 3,
      email: 'student@cruiser.com',
      firstName: 'Student',
      lastName: 'Pilot',
      name: 'Student Pilot',
      role: 'student_pilot',
      status: 'pending',
      phoneNumber: '+1 (555) 333-3333',
      createdAt: '2024-01-20T00:00:00Z',
      imageUrl: 'https://picsum.photos/150/150?random=3',
      address: '789 Student Blvd',
      city: 'Student City',
      region: 'Student Region',
      country: 'USA',
      postalCode: '11111',
      nationality: 'American',
      dateOfBirth: '1995-12-10T00:00:00Z',
      nationalId: 'STUDENT789',
      sex: 'M',
      hasPPL: false,
      pplNumber: '',
      pplIssueDate: null,
      pplExpiryDate: null,
      medicalCertificateNumber: 'MED345678',
      medicalExamDate: '2024-01-01T00:00:00Z',
      medicalIssueDate: '2024-01-01T00:00:00Z',
      medicalExpiryDate: '2026-01-01T00:00:00Z',
      totalFlightHours: 25,
      creditedHours: 20
    }
  ]
};

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Cruiser Aviation Platform API (Dev)',
    version: '1.0.0',
    environment: 'development',
    timestamp: new Date().toISOString(),
    dev: true
  });
});

// App info
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Cruiser Aviation (Dev)',
    version: '1.0.0',
    environment: 'development',
    features: ['fast-development', 'mock-data', 'hot-reload']
  });
});

// Authentication handled by Cloudflare Access
app.get('/api/auth/profile', (req, res) => {
  // For development, return a mock admin user
  res.json({
    user: {
      id: 'admin-dev',
      email: 'admin@cruiser.com',
      name: 'Development Admin',
      picture: null,
      custom_claims: { role: 'admin' }
    },
    authenticated: true,
    message: 'Authentication handled by Cloudflare Access'
  });
});

// Admin dashboard
app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    user: {
      id: 'admin-dev',
      email: 'admin@cruiser.com',
      name: 'Development Admin'
    },
    stats: {
      users: mockData.users.length,
      bases: mockData.bases.length,
      services: mockData.services.length,
      aircraft: mockData.aircraft.length,
      total_flight_hours: 1250,
      active_users: 15,
      recent_activity: [
        { type: 'flight', user: 'John Doe', time: '2 hours ago' },
        { type: 'maintenance', aircraft: 'N12345', time: '1 day ago' }
      ]
    }
  });
});

// Services
app.get('/api/admin/services', (req, res) => {
  res.json(mockData.services);
});

// Create service
app.post('/api/admin/services', (req, res) => {
  const newService = {
    id: mockData.services.length + 1,
    ...req.body,
    isActive: true
  };
  mockData.services.push(newService);
  res.status(201).json(newService);
});

// Update service
app.put('/api/admin/services/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const serviceIndex = mockData.services.findIndex(s => s.id === id);
  
  if (serviceIndex === -1) {
    return res.status(404).json({ error: 'Service not found' });
  }
  
  mockData.services[serviceIndex] = { ...mockData.services[serviceIndex], ...req.body };
  res.json(mockData.services[serviceIndex]);
});

// Delete service
app.delete('/api/admin/services/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const serviceIndex = mockData.services.findIndex(s => s.id === id);
  
  if (serviceIndex === -1) {
    return res.status(404).json({ error: 'Service not found' });
  }
  
  mockData.services.splice(serviceIndex, 1);
  res.status(204).send();
});

// Upload service image
app.post('/api/admin/services/upload-image', upload.single('image'), (req, res) => {
  try {
    console.log('Service image upload request received');
    console.log('Request headers:', req.headers);
    console.log('Request body keys:', Object.keys(req.body || {}));
    console.log('File info:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file');

    if (!req.file) {
      console.error('No file provided in request');
      return res.status(400).json({ 
        error: 'No image file provided',
        message: 'Please select an image file to upload'
      });
    }

    // Validate file type
    if (!req.file.mimetype.startsWith('image/')) {
      console.error('Invalid file type:', req.file.mimetype);
      return res.status(400).json({ 
        error: 'Invalid file type',
        message: 'Only image files are allowed'
      });
    }

    // Validate file size (additional check)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (req.file.size > maxSize) {
      console.error('File too large:', req.file.size);
      return res.status(413).json({ 
        error: 'File too large',
        message: `File size must be less than ${maxSize / (1024 * 1024)}MB`
      });
    }

    // For local development, we'll create a data URL from the uploaded file
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = req.file.originalname.split('.').pop() || 'jpg';
    
    // Convert the file buffer to a data URL
    const base64Data = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64Data}`;
    
    // Also provide a fallback URL for testing
    const fallbackUrl = `https://picsum.photos/400/300?random=${randomId}`;
    
    console.log('Service image uploaded successfully:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    res.json({ 
      url: dataUrl, // Use data URL for local development
      fallbackUrl: fallbackUrl, // Fallback for testing
      message: 'Service image uploaded successfully (local development)',
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      note: 'Using data URL for local development. In production, this would be a cloud storage URL.'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload image',
      message: error.message,
      details: 'Please try again with a smaller image or different format'
    });
  }
});

// Bases
app.get('/api/admin/bases', (req, res) => {
  res.json(mockData.bases);
});

// Create base
app.post('/api/admin/bases', (req, res) => {
  const newBase = {
    id: mockData.bases.length + 1,
    ...req.body,
    isActive: req.body.isActive !== undefined ? req.body.isActive : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockData.bases.push(newBase);
  res.status(201).json(newBase);
});

// Update base
app.put('/api/admin/bases/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const baseIndex = mockData.bases.findIndex(b => b.id === id);
  
  if (baseIndex === -1) {
    return res.status(404).json({ error: 'Base not found' });
  }
  
  mockData.bases[baseIndex] = { 
    ...mockData.bases[baseIndex], 
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  res.json(mockData.bases[baseIndex]);
});

// Delete base
app.delete('/api/admin/bases/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const baseIndex = mockData.bases.findIndex(b => b.id === id);
  
  if (baseIndex === -1) {
    return res.status(404).json({ error: 'Base not found' });
  }
  
  mockData.bases.splice(baseIndex, 1);
  res.status(204).send();
});

// Upload base image
app.post('/api/admin/bases/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // For local development, we'll create a data URL from the uploaded file
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = req.file.originalname.split('.').pop() || 'jpg';
    
    // Convert the file buffer to a data URL
    const base64Data = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64Data}`;
    
    // Also provide a fallback URL for testing
    const fallbackUrl = `https://picsum.photos/400/300?random=${randomId}`;
    
    res.json({ 
      url: dataUrl, // Use data URL for local development
      fallbackUrl: fallbackUrl, // Fallback for testing
      message: 'Base image uploaded successfully (local development)',
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      note: 'Using data URL for local development. In production, this would be a cloud storage URL.'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Aircraft
app.get('/api/admin/aircraft', (req, res) => {
  res.json(mockData.aircraft);
});

// Create aircraft
app.post('/api/admin/aircraft', (req, res) => {
  const newAircraft = {
    id: mockData.aircraft.length + 1,
    ...req.body,
    isActive: req.body.isActive !== undefined ? req.body.isActive : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockData.aircraft.push(newAircraft);
  res.status(201).json(newAircraft);
});

// Update aircraft
app.put('/api/admin/aircraft/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const aircraftIndex = mockData.aircraft.findIndex(a => a.id === id);
  
  if (aircraftIndex === -1) {
    return res.status(404).json({ error: 'Aircraft not found' });
  }
  
  mockData.aircraft[aircraftIndex] = { 
    ...mockData.aircraft[aircraftIndex], 
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  res.json(mockData.aircraft[aircraftIndex]);
});

// Delete aircraft
app.delete('/api/admin/aircraft/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const aircraftIndex = mockData.aircraft.findIndex(a => a.id === id);
  
  if (aircraftIndex === -1) {
    return res.status(404).json({ error: 'Aircraft not found' });
  }
  
  mockData.aircraft.splice(aircraftIndex, 1);
  res.status(204).send();
});

// Upload aircraft image
app.post('/api/admin/aircraft/upload-image', upload.single('image'), (req, res) => {
  try {
    console.log('Aircraft image upload request received');
    console.log('Request headers:', req.headers);
    console.log('Request body keys:', Object.keys(req.body || {}));
    console.log('File info:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file');

    if (!req.file) {
      console.error('No file provided in request');
      return res.status(400).json({ 
        error: 'No image file provided',
        message: 'Please select an image file to upload'
      });
    }

    // Validate file type
    if (!req.file.mimetype.startsWith('image/')) {
      console.error('Invalid file type:', req.file.mimetype);
      return res.status(400).json({ 
        error: 'Invalid file type',
        message: 'Only image files are allowed'
      });
    }

    // Validate file size (additional check)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (req.file.size > maxSize) {
      console.error('File too large:', req.file.size);
      return res.status(413).json({ 
        error: 'File too large',
        message: `File size must be less than ${maxSize / (1024 * 1024)}MB`
      });
    }

    // For local development, we'll create a data URL from the uploaded file
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = req.file.originalname.split('.').pop() || 'jpg';
    
    // Convert the file buffer to a data URL
    const base64Data = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64Data}`;
    
    // Also provide a fallback URL for testing
    const fallbackUrl = `https://picsum.photos/400/300?random=${randomId}`;
    
    console.log('Image uploaded successfully:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    res.json({ 
      url: dataUrl, // Use data URL for local development
      fallbackUrl: fallbackUrl, // Fallback for testing
      message: 'Aircraft image uploaded successfully (local development)',
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      note: 'Using data URL for local development. In production, this would be a cloud storage URL.'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload image',
      message: error.message,
      details: 'Please try again with a smaller image or different format'
    });
  }
});

// Users
app.get('/api/users', (req, res) => {
  res.json(mockData.users);
});

// Admin Users endpoints
app.get('/api/admin/users', (req, res) => {
  res.json(mockData.users);
});

// Create user
app.post('/api/admin/users', (req, res) => {
  const newUser = {
    id: mockData.users.length + 1,
    ...req.body,
    createdAt: new Date().toISOString(),
    status: req.body.status || 'pending'
  };
  mockData.users.push(newUser);
  res.status(201).json(newUser);
});

// Update user
app.put('/api/admin/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const userIndex = mockData.users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  mockData.users[userIndex] = { ...mockData.users[userIndex], ...req.body };
  res.json(mockData.users[userIndex]);
});

// Delete user
app.delete('/api/admin/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const userIndex = mockData.users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  mockData.users.splice(userIndex, 1);
  res.status(204).send();
});

// Upload user image
app.post('/api/admin/users/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // For local development, we'll create a data URL from the uploaded file
    // This way the image is embedded directly in the URL and works locally
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = req.file.originalname.split('.').pop() || 'jpg';
    
    // Convert the file buffer to a data URL
    const base64Data = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64Data}`;
    
    // Also provide a fallback URL for testing
    const fallbackUrl = `https://picsum.photos/150/150?random=${randomId}`;
    
    res.json({ 
      url: dataUrl, // Use data URL for local development
      fallbackUrl: fallbackUrl, // Fallback for testing
      message: 'Image uploaded successfully (local development)',
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      note: 'Using data URL for local development. In production, this would be a cloud storage URL.'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// API docs endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    endpoints: [
      { method: 'GET', path: '/health', description: 'Health check' },
      { method: 'GET', path: '/api/info', description: 'App info' },
      { method: 'GET', path: '/api/auth/profile', description: 'User profile (mock admin)' },
      { method: 'GET', path: '/api/admin/dashboard', description: 'Admin dashboard' },
      { method: 'GET', path: '/api/admin/services', description: 'Services list' },
      { method: 'GET', path: '/api/admin/bases', description: 'Bases list' },
      { method: 'GET', path: '/api/admin/aircraft', description: 'Aircraft list' },
      { method: 'GET', path: '/api/users', description: 'Users list' }
    ],
    note: 'All endpoints return JSON. This is a mock API for fast local development.'
  });
});

// Fallback for any other API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found in development mode',
    path: req.path,
    method: req.method
  });
});

// Serve static files (for production-like testing)
app.use(express.static(path.join(__dirname, '../dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Improved error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  
  // Handle specific error types
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ 
      error: 'Payload too large', 
      message: 'The request payload exceeds the maximum allowed size',
      limit: '50MB for JSON, 25MB for files'
    });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ 
      error: 'File too large', 
      message: 'The uploaded file exceeds the maximum allowed size',
      limit: '25MB'
    });
  }
  
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ 
      error: 'Invalid file type', 
      message: 'Only image files are allowed'
    });
  }
  
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 Frontend should run on: http://localhost:3000`);
}); 