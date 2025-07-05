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
    fileSize: 25 * 1024 * 1024, // 25MB limit
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
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 image data
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
    { id: 1, name: 'Main Airport', location: 'Downtown', code: 'MAIN' },
    { id: 2, name: 'Regional Field', location: 'Suburbs', code: 'REG' }
  ],
  aircraft: [
    { id: 1, name: 'Cessna 172', type: 'Single Engine', registration: 'N12345' },
    { id: 2, name: 'Piper Arrow', type: 'Single Engine', registration: 'N67890' }
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

// Magic link endpoint
app.post('/api/auth/magic-link', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Generate a simple token for development
  const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
  
  res.json({
    message: 'Magic link sent successfully',
    token: token,
    magicLink: `http://localhost:3000/login?token=${token}`
  });
});

// Auth verification
app.get('/api/auth/verify', (req, res) => {
  const { token } = req.query;
  
  if (token) {
    try {
      const decoded = Buffer.from(token, 'base64').toString();
      const [email, timestamp] = decoded.split(':');
      const tokenAge = Date.now() - parseInt(timestamp);
      
      if (tokenAge < 3600000) { // 1 hour
        res.json({
          authenticated: true,
          message: 'Magic link token is valid',
          user: { email, sub: email }
        });
      } else {
        res.json({
          authenticated: false,
          message: 'Magic link token has expired'
        });
      }
    } catch (error) {
      res.json({
        authenticated: false,
        message: 'Invalid magic link token format'
      });
    }
  } else {
    res.json({
      authenticated: false,
      message: 'No token provided'
    });
  }
});

// Auth profile
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
    authenticated: true
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
      message: 'Aircraft image uploaded successfully (local development)',
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
      { method: 'POST', path: '/api/auth/magic-link', description: 'Magic link generation', example: { email: 'user@example.com' } },
      { method: 'GET', path: '/api/auth/verify', description: 'Token verification', example: { token: '...' } },
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
  console.log(`🔗 Magic link example: http://localhost:${PORT}/api/auth/magic-link`);
  console.log(`📱 Frontend should run on: http://localhost:3000`);
}); 