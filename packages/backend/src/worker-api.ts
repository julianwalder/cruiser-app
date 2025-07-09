import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { jwt } from 'hono/jwt';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { SignJWT } from 'jose';

// Types
interface Env {
  DB: D1Database;
  STORAGE: R2Bucket;
  CACHE: KVNamespace;
  JWT_SECRET: string;
  CLOUDFLARE_ACCESS_AUD: string;
}

// Database schemas
const UserSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['admin', 'user']).default('user'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const BaseSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  location: z.string(),
  description: z.string().optional(),
  image_url: z.string().optional(),
  isActive: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const AircraftSchema = z.object({
  id: z.string().optional(),
  callSign: z.string(),
  type: z.string(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  seats: z.number().optional(),
  maxRange: z.number().optional(),
  cruiseSpeed: z.number().optional(),
  fuelCapacity: z.number().optional(),
  yearManufactured: z.number().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  baseId: z.string(),
  imageUrl: z.string().optional(),
  totalFlightHours: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const ServiceSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string(),
  base_id: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Create Hono app
const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'https://app.cruiseraviation.com', 'https://staging.cruiseraviation.com'],
  credentials: true,
}));

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Development mode check
const isDevelopment = (c: any) => {
  const origin = c.req.header('Origin');
  return origin?.includes('localhost') || origin?.includes('127.0.0.1');
};

// Mock user for development
const getMockUser = () => ({
  sub: 'dev-user-id',
  email: 'dev@cruiseraviation.com',
  name: 'Development User',
  role: 'superadmin',
  groups: ['superadmin', 'admin', 'instructor', 'basemanager', 'user']
});

// Authentication middleware with development bypass
const authMiddleware = async (c: any, next: any) => {
  // In development mode, bypass authentication
  if (isDevelopment(c)) {
    c.set('jwtPayload', getMockUser());
    await next();
    return;
  }

  // In production, use JWT authentication
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET || 'your-jwt-secret-here',
  });
  
  return jwtMiddleware(c, next);
};

// Admin middleware
const adminMiddleware = async (c: any, next: any) => {
  const user = c.get('jwtPayload');
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return c.json({ error: 'Admin access required' }, 403);
  }
  await next();
};

// File upload helper
async function uploadFile(file: File, env: Env, folder: string): Promise<string> {
  const key = `${folder}/${Date.now()}-${file.name}`;
  await env.STORAGE.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  });
  return key;
}

// Routes
app.get('/', (c) => {
  return c.json({ message: 'Cruiser Aviation API', version: '1.0.0' });
});

// Auth routes - Cloudflare Access handles authentication
app.get('/api/auth/profile', async (c) => {
  // In development mode, return mock user
  if (isDevelopment(c)) {
    const mockUser = getMockUser();
    return c.json({ 
      user: mockUser,
      authenticated: true,
      message: 'Development mode - using mock user'
    });
  }

  // In production, use Cloudflare Access
  const cfAccessJwtAssertion = c.req.header('CF-Access-Jwt-Assertion');
  
  if (!cfAccessJwtAssertion) {
    return c.json({ error: 'No Cloudflare Access token found' }, 401);
  }
  
  try {
    // In a real implementation, you would verify the JWT here
    // For now, we'll return a simple response
    return c.json({ 
      message: 'Authentication handled by Cloudflare Access',
      authenticated: true
    });
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

// Protected routes
app.use('/api/*', authMiddleware);

// Admin routes
app.get('/api/admin/users', adminMiddleware, async (c) => {
  const users = await c.env.DB.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
  return c.json(users.results);
});

app.get('/api/admin/bases', adminMiddleware, async (c) => {
  const bases = await c.env.DB.prepare('SELECT * FROM bases ORDER BY created_at DESC').all();
  
  // Transform the data to match frontend expectations (camelCase)
  const transformedBases = bases.results.map((base: any) => ({
    id: base.id,
    name: base.name,
    location: base.location,
    description: base.description,
    imageUrl: base.image_url,
    isActive: base.is_active === 1 || base.is_active === true,
    created_at: base.created_at,
    updated_at: base.updated_at
  }));
  
  return c.json(transformedBases);
});

app.post('/api/admin/bases', adminMiddleware, zValidator('json', BaseSchema), async (c) => {
  const data = c.req.valid('json');
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await c.env.DB.prepare(`
    INSERT INTO bases (id, name, location, description, image_url, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, data.name, data.location, data.description, data.image_url, data.isActive ? 1 : 0, now, now).run();
  
  return c.json({ id, ...data, created_at: now, updated_at: now }, 201);
});

app.put('/api/admin/bases/:id', adminMiddleware, zValidator('json', BaseSchema), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');
  const now = new Date().toISOString();
  
  await c.env.DB.prepare(`
    UPDATE bases SET name = ?, location = ?, description = ?, image_url = ?, is_active = ?, updated_at = ?
    WHERE id = ?
  `).bind(data.name, data.location, data.description, data.image_url, data.isActive ? 1 : 0, now, id).run();
  
  return c.json({ id, ...data, updated_at: now });
});

app.delete('/api/admin/bases/:id', adminMiddleware, async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM bases WHERE id = ?').bind(id).run();
  return c.json({ message: 'Base deleted' });
});

app.get('/api/admin/aircraft', adminMiddleware, async (c) => {
  const aircraft = await c.env.DB.prepare(`
    SELECT a.*, b.name as base_name 
    FROM aircraft a 
    LEFT JOIN bases b ON a.base_id = b.id 
    ORDER BY a.created_at DESC
  `).all();
  
  // Transform the data to match frontend expectations (camelCase)
  const transformedAircraft = aircraft.results.map((aircraft: any) => {
    const images = aircraft.images ? JSON.parse(aircraft.images) : [];
    return {
      id: aircraft.id,
      callSign: aircraft.registration, // Use registration as callSign
      type: aircraft.type,
      manufacturer: '', // Not stored in DB
      model: '', // Not stored in DB
      seats: 4, // Default value
      maxRange: 0, // Default value
      cruiseSpeed: 0, // Default value
      fuelCapacity: 0, // Default value
      yearManufactured: new Date().getFullYear(), // Default value
      description: '', // Not stored in DB
      isActive: true, // Default value
      baseId: aircraft.base_id,
      imageUrl: images.length > 0 ? images[0] : '', // First image from array
      totalFlightHours: 0, // Default value
      created_at: aircraft.created_at,
      updated_at: aircraft.updated_at,
      base_name: aircraft.base_name
    };
  });
  
  return c.json(transformedAircraft);
});

app.post('/api/admin/aircraft', adminMiddleware, zValidator('json', AircraftSchema), async (c) => {
  const data = c.req.valid('json');
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await c.env.DB.prepare(`
    INSERT INTO aircraft (id, registration, type, base_id, documents, images, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, 
    data.callSign, // Use callSign as registration
    data.type, 
    data.baseId, 
    JSON.stringify([]), // Empty documents array
    JSON.stringify(data.imageUrl ? [data.imageUrl] : []), // Store imageUrl in images array
    now, 
    now
  ).run();
  
  return c.json({ id, ...data, created_at: now, updated_at: now }, 201);
});

app.put('/api/admin/aircraft/:id', adminMiddleware, zValidator('json', AircraftSchema), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');
  const now = new Date().toISOString();
  
  await c.env.DB.prepare(`
    UPDATE aircraft SET registration = ?, type = ?, base_id = ?, documents = ?, images = ?, updated_at = ?
    WHERE id = ?
  `).bind(
    data.callSign, // Use callSign as registration
    data.type, 
    data.baseId, 
    JSON.stringify([]), // Empty documents array
    JSON.stringify(data.imageUrl ? [data.imageUrl] : []), // Store imageUrl in images array
    now, 
    id
  ).run();
  
  return c.json({ id, ...data, updated_at: now });
});

app.delete('/api/admin/aircraft/:id', adminMiddleware, async (c) => {
  const id = c.req.param('id');
  
  await c.env.DB.prepare('DELETE FROM aircraft WHERE id = ?').bind(id).run();
  
  return c.json({ message: 'Aircraft deleted successfully' });
});

// Generic image upload function
async function handleImageUpload(c: any, folder: string, fieldName: string = 'image') {
  try {
    // Try to parse form data - handle both cases where Content-Type is set or not
    let formData;
    try {
      formData = await c.req.formData();
    } catch (formError) {
      console.error('FormData parsing error:', formError);
      return c.json({ error: 'Failed to parse form data. Please ensure you are uploading a valid image file.' }, 400);
    }
    
    const file = formData.get(fieldName);
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file uploaded or invalid file' }, 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' }, 400);
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return c.json({ error: 'File too large. Maximum size is 5MB.' }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().split('-')[0];
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${folder}/${timestamp}-${randomId}.${extension}`;

    // Upload to R2
    await c.env.STORAGE.put(filename, await file.arrayBuffer(), {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Return the file URL
    const fileUrl = `https://cruiser-storage-staging.r2.cloudflarestorage.com/${filename}`;
    
    return c.json({ 
      success: true,
      url: fileUrl,
      filename: filename,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Failed to upload file' }, 500);
  }
}

// Aircraft image upload endpoint
app.post('/api/admin/aircraft/upload-image', adminMiddleware, async (c) => {
  return handleImageUpload(c, 'aircraft', 'image');
});

// Base image upload endpoint
app.post('/api/admin/bases/upload-image', adminMiddleware, async (c) => {
  return handleImageUpload(c, 'bases', 'image');
});



// Service image upload endpoint
app.post('/api/admin/services/upload-image', adminMiddleware, async (c) => {
  return handleImageUpload(c, 'services', 'image');
});

// User image upload endpoint
app.post('/api/admin/users/upload-image', adminMiddleware, async (c) => {
  return handleImageUpload(c, 'users', 'image');
});

app.get('/api/admin/services', adminMiddleware, async (c) => {
  const services = await c.env.DB.prepare(`
    SELECT s.*, b.name as base_name 
    FROM services s 
    LEFT JOIN bases b ON s.base_id = b.id 
    ORDER BY s.created_at DESC
  `).all();
  
  // Transform the data to match frontend expectations
  const transformedServices = services.results.map((service: any) => ({
    id: service.id,
    name: service.name,
    description: service.description,
    type: service.type,
    base_id: service.base_id,
    basePrice: service.base_price,
    duration: service.duration,
    defaultPaymentPlan: service.default_payment_plan,
    isActive: service.is_active === 1,
    imageUrl: service.image_url,
    created_at: service.created_at,
    updated_at: service.updated_at,
    base_name: service.base_name
  }));
  
  return c.json(transformedServices);
});

app.post('/api/admin/services', adminMiddleware, async (c) => {
  const data = await c.req.json();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await c.env.DB.prepare(`
    INSERT INTO services (id, name, description, type, base_id, base_price, duration, default_payment_plan, is_active, image_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, 
    data.name, 
    data.description, 
    data.type || 'flight_school',
    data.base_id || 'base-1',
    data.basePrice || 0,
    data.duration || '',
    data.defaultPaymentPlan || 'full_price',
    data.isActive ? 1 : 0,
    data.imageUrl || null,
    now, 
    now
  ).run();
  
  return c.json({ 
    id, 
    name: data.name,
    description: data.description,
    type: data.type || 'flight_school',
    base_id: data.base_id || 'base-1',
    base_price: data.basePrice || 0,
    duration: data.duration || '',
    default_payment_plan: data.defaultPaymentPlan || 'full_price',
    is_active: data.isActive ? 1 : 0,
    image_url: data.imageUrl || null,
    created_at: now, 
    updated_at: now 
  }, 201);
});

app.put('/api/admin/services/:id', adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const data = await c.req.json();
  const now = new Date().toISOString();
  
  await c.env.DB.prepare(`
    UPDATE services SET name = ?, description = ?, type = ?, base_id = ?, base_price = ?, duration = ?, default_payment_plan = ?, is_active = ?, image_url = ?, updated_at = ?
    WHERE id = ?
  `).bind(
    data.name,
    data.description,
    data.type || 'flight_school',
    data.base_id || 'base-1',
    data.basePrice || 0,
    data.duration || '',
    data.defaultPaymentPlan || 'full_price',
    data.isActive ? 1 : 0,
    data.imageUrl || null,
    now,
    id
  ).run();
  
  return c.json({ 
    id,
    name: data.name,
    description: data.description,
    type: data.type || 'flight_school',
    base_id: data.base_id || 'base-1',
    base_price: data.basePrice || 0,
    duration: data.duration || '',
    default_payment_plan: data.defaultPaymentPlan || 'full_price',
    is_active: data.isActive ? 1 : 0,
    image_url: data.imageUrl || null,
    updated_at: now 
  });
});

app.delete('/api/admin/services/:id', adminMiddleware, async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM services WHERE id = ?').bind(id).run();
  return c.json({ message: 'Service deleted' });
});

// File upload routes
app.post('/api/upload/:type', async (c) => {
  const type = c.req.param('type'); // aircraft, base, document
  const formData = await c.req.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return c.json({ error: 'No file provided' }, 400);
  }
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    return c.json({ error: 'Invalid file type' }, 400);
  }
  
  // Upload to R2
  const key = await uploadFile(file, c.env, type);
  const url = `https://cruiser-storage-staging.r2.cloudflarestorage.com/${key}`;
  
  return c.json({ 
    url,
    key,
    filename: file.name,
    size: file.size,
    type: file.type
  });
});

// Public routes (for normal users)
app.get('/api/bases', async (c) => {
  const bases = await c.env.DB.prepare('SELECT * FROM bases ORDER BY name').all();
  return c.json(bases.results);
});

app.get('/api/aircraft', async (c) => {
  const aircraft = await c.env.DB.prepare(`
    SELECT a.*, b.name as base_name 
    FROM aircraft a 
    LEFT JOIN bases b ON a.base_id = b.id 
    ORDER BY a.registration
  `).all();
  return c.json(aircraft.results);
});

app.get('/api/services', async (c) => {
  const services = await c.env.DB.prepare(`
    SELECT s.*, b.name as base_name 
    FROM services s 
    LEFT JOIN bases b ON s.base_id = b.id 
    ORDER BY s.name
  `).all();
  return c.json(services.results);
});

// User endpoints
app.get('/api/users', async (c) => {
  const users = await c.env.DB.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
  return c.json(users.results);
});

app.get('/api/users/me', async (c) => {
  // In development mode, return mock user
  if (isDevelopment(c)) {
    const mockUser = getMockUser();
    return c.json({
      id: mockUser.sub,
      email: mockUser.email,
      firstName: 'Development',
      lastName: 'User',
      role: mockUser.role,
      status: 'active',
      isFullyVerified: true,
      hasPPL: false,
      creditedHours: 45.0,
      totalFlightHours: 12.5,
      baseId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  // In production, get user from JWT
  const user = c.get('jwtPayload');
  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }
  
  return c.json({
    id: user.sub,
    email: user.email,
    firstName: user.name?.split(' ')[0] || 'Unknown',
    lastName: user.name?.split(' ')[1] || 'User',
    role: user.role,
    status: 'active',
    isFullyVerified: true,
    hasPPL: false,
    creditedHours: 45.0,
    totalFlightHours: 12.5,
    baseId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

// Flights endpoints
app.get('/api/flights', async (c) => {
  // For now, return empty array - flights table might not exist yet
  return c.json([]);
});

app.post('/api/flights', async (c) => {
  // For now, return success - flights table might not exist yet
  return c.json({ message: 'Flight created successfully' }, 201);
});

// User profile
app.get('/api/profile', async (c) => {
  const user = c.get('jwtPayload');
  const userData = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(user.userId).first();
  return c.json(userData);
});

// ============================================================================
// AIRFIELD MANAGEMENT ENDPOINTS (Superadmin only)
// ============================================================================

// Superadmin middleware - more restrictive than admin
const superadminMiddleware = async (c: any, next: any) => {
  const user = c.get('jwtPayload');
  if (!user || user.role !== 'superadmin') {
    return c.json({ error: 'Superadmin access required' }, 403);
  }
  await next();
};

// Base designation image upload endpoint
app.post('/api/superadmin/bases/upload-image', superadminMiddleware, async (c) => {
  return handleImageUpload(c, 'base-designations', 'image');
});

// Operational Areas endpoints
app.get('/api/superadmin/operational-areas', superadminMiddleware, async (c) => {
  const areas = await c.env.DB.prepare(`
    SELECT * FROM operational_areas 
    ORDER BY type DESC, name ASC
  `).all();
  
  // Transform to hierarchical structure
  const continents = areas.results.filter((area: any) => area.type === 'continent');
  const countries = areas.results.filter((area: any) => area.type === 'country');
  
  const hierarchicalAreas = continents.map((continent: any) => ({
    ...continent,
    countries: countries.filter((country: any) => country.parent_id === continent.id)
  }));
  
  return c.json(hierarchicalAreas);
});

app.put('/api/superadmin/operational-areas/:id', superadminMiddleware, async (c) => {
  const id = c.req.param('id');
  const data = await c.req.json();
  const now = new Date().toISOString();
  
  await c.env.DB.prepare(`
    UPDATE operational_areas SET is_active = ?, updated_at = ?
    WHERE id = ?
  `).bind(data.isActive ? 1 : 0, now, id).run();
  
  return c.json({ id, isActive: data.isActive, updated_at: now });
});

// Imported Airfields endpoints
app.get('/api/superadmin/airfields', superadminMiddleware, async (c) => {
  const { search, country, type, isBase, is_base } = c.req.query();
  
  // Handle both parameter names for compatibility
  const baseFilter = isBase !== undefined ? isBase : is_base;
  
  console.log('🔍 Airfields GET request params:', { search, country, type, isBase, is_base, baseFilter });
  
  let query = `
    SELECT ia.*, 
           CASE WHEN bd.id IS NOT NULL THEN 1 ELSE 0 END as is_base,
           bd.base_name,
           bd.description as base_description,
           bd.base_manager,
           bd.notes as base_notes,
           bd.image_url as base_image_url
    FROM imported_airfields ia
    LEFT JOIN base_designations bd ON ia.id = bd.airfield_id AND bd.is_active = 1
    WHERE ia.is_active = 1
  `;
  
  const params: any[] = [];
  
  if (search) {
    query += ` AND (ia.name LIKE ? OR ia.icao_code LIKE ? OR ia.iata_code LIKE ?)`;
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  if (country) {
    query += ` AND ia.country_code = ?`;
    params.push(country);
  }
  
  if (type && type !== 'all') {
    query += ` AND ia.type = ?`;
    params.push(type);
  }
  
  if (baseFilter !== undefined) {
    if (baseFilter === 'true') {
      query += ` AND bd.id IS NOT NULL`;
    } else {
      query += ` AND bd.id IS NULL`;
    }
  }
  
  query += ` ORDER BY ia.name ASC`;
  
  console.log('🔍 Airfields query:', query);
  console.log('🔍 Airfields params:', params);
  
  const airfields = await c.env.DB.prepare(query).bind(...params).all();
  
  console.log('🔍 Airfields query result:', {
    count: airfields.results?.length || 0,
    sample: airfields.results?.[0],
    allResults: airfields.results
  });
  
  return c.json(airfields.results);
});

// Delete individual airfield
app.delete('/api/superadmin/airfields/:id', superadminMiddleware, async (c) => {
  const id = c.req.param('id');
  
  try {
    // First, delete any associated base designations
    await c.env.DB.prepare(`
      DELETE FROM base_designations WHERE airfield_id = ?
    `).bind(id).run();
    
    // Then delete the airfield
    const result = await c.env.DB.prepare(`
      DELETE FROM imported_airfields WHERE id = ?
    `).bind(id).run();
    
    if (result.meta.changes === 0) {
      return c.json({ error: 'Airfield not found' }, 404);
    }
    
    return c.json({ message: 'Airfield deleted successfully' });
  } catch (error) {
    console.error('Error deleting airfield:', error);
    return c.json({ error: 'Failed to delete airfield' }, 500);
  }
});

// Import airfields from OurAirports dataset
app.post('/api/superadmin/airfields/import', superadminMiddleware, async (c) => {
  const data = await c.req.json();
  const { countryCodes, types = ['airport'] } = data;
  
  console.log('🔍 Import request data:', { data, countryCodes, types });
  
  if (!countryCodes || countryCodes.length === 0) {
    console.log('❌ Validation failed: No country codes provided');
    return c.json({ error: 'At least one country code is required' }, 400);
  }
  
  // Create import job
  const jobId = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await c.env.DB.prepare(`
    INSERT INTO import_jobs (id, job_type, status, created_at)
    VALUES (?, 'airfields_import', 'running', ?)
  `).bind(jobId, now).run();
  
  try {
    // Fetch real airfield data from OurAirports API
    const allAirfields = [];
    let totalProcessed = 0;
    
    for (const countryCode of countryCodes) {
      console.log(`🔍 Fetching airfields for country: ${countryCode}`);
      
      try {
        // Use real OurAirports data exclusively
        const countryAirfields = await fetchOurAirportsData(countryCode, types);
        
        if (countryAirfields.length === 0) {
          console.log(`⚠️ No airfields found for country ${countryCode} in OurAirports data`);
        }
        
        console.log(`✅ Found ${countryAirfields.length} airfields for ${countryCode}`);
        allAirfields.push(...countryAirfields);
        totalProcessed += countryAirfields.length;
        
      } catch (error) {
        console.error(`❌ Error fetching airfields for ${countryCode}:`, error);
        // Continue with other countries even if one fails
      }
    }
    
    // Real OurAirports data fetching function
    async function fetchOurAirportsData(countryCode: string, types: string[]) {
      try {
        console.log(`🔍 [IMPORT] Fetching real OurAirports data for country: ${countryCode} with types: ${types.join(', ')}`);
        console.log(`🔍 [IMPORT] Will include: ${types.join(', ')}`);
        // Fetch countries data for better country names
        let countriesData: any = {};
        try {
          const countriesResponse = await fetch('https://davidmegginson.github.io/ourairports-data/countries.csv');
          if (countriesResponse.ok) {
            const countriesText = await countriesResponse.text();
            const countriesLines = countriesText.split('\n').slice(1); // Skip header
            for (const line of countriesLines) {
              if (!line.trim()) continue;
              const columns = parseCSVLine(line);
              if (columns.length >= 3) {
                const [code, name, continent] = columns;
                countriesData[code] = { name, continent };
              }
            }
          }
        } catch (error) {
          console.log('⚠️ Could not fetch countries data, using fallback');
        }
        // Fetch regions data for better region information
        let regionsData: any = {};
        try {
          const regionsResponse = await fetch('https://davidmegginson.github.io/ourairports-data/regions.csv');
          if (regionsResponse.ok) {
            const regionsText = await regionsResponse.text();
            const regionsLines = regionsText.split('\n').slice(1); // Skip header
            for (const line of regionsLines) {
              if (!line.trim()) continue;
              const columns = parseCSVLine(line);
              if (columns.length >= 4) {
                const [code, local_code, name, continent, country_code] = columns;
                if (country_code === countryCode) {
                  regionsData[local_code] = name;
                }
              }
            }
          }
        } catch (error) {
          console.log('⚠️ Could not fetch regions data, using fallback');
        }
        // OurAirports CSV URL - direct download link
        const csvUrl = 'https://davidmegginson.github.io/ourairports-data/airports.csv';
        const response = await fetch(csvUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch OurAirports data: ${response.status}`);
        }
        const csvText = await response.text();
        const lines = csvText.split('\n');
        console.log(`[IMPORT] airports.csv lines: ${lines.length}`);
        console.log(`[IMPORT] First 5 lines:`, lines.slice(0, 5));
        // Skip header line
        const dataLines = lines.slice(1);
        const airfields = [];
        let processedCount = 0;
        let matchCount = 0;
        for (const line of dataLines) {
          if (!line.trim()) continue;
          // Parse CSV line (handle commas within quotes)
          const columns = parseCSVLine(line);
          if (columns.length < 19) continue; // Skip malformed lines - need at least 19 columns
          const [
            id, ident, type, name, latitude_deg, longitude_deg, elevation_ft, continent, 
            iso_country, iso_region, municipality, scheduled_service, icao_code, iata_code, 
            gps_code, local_code, home_link, wikipedia_link, keywords
          ] = columns;
          // Filter by country code and type - map OurAirports types to our supported types
          const mapOurAirportsType = (ourairportsType: string): string => {
            switch (ourairportsType) {
              case 'small_airport':
              case 'medium_airport':
              case 'large_airport':
                return 'airport'; // Map all airport sizes to 'airport'
              case 'balloonport':
                return 'heliport'; // Map balloonport to heliport for now
              default:
                return ourairportsType; // Keep other types as-is
            }
          };
          
          const mappedType = mapOurAirportsType(type);
          const isRequestedType = types.some(requestedType => {
            switch (requestedType) {
              case 'airport':
                return mappedType === 'airport';
              case 'small_airport':
                return type === 'small_airport';
              case 'medium_airport':
                return type === 'medium_airport';
              case 'large_airport':
                return type === 'large_airport';
              case 'heliport':
                return mappedType === 'heliport';
              case 'seaplane_base':
                return mappedType === 'seaplane_base';
              case 'balloonport':
                return type === 'balloonport';
              case 'closed':
                return mappedType === 'closed';
              default:
                return mappedType === requestedType;
            }
          });
          
          if (iso_country === countryCode && isRequestedType) {
            matchCount++;
            // Skip closed airports
            if (name.toLowerCase().includes('closed') || name.toLowerCase().includes('abandoned')) {
              continue;
            }
            // Only include airports with valid coordinates
            const lat = parseFloat(latitude_deg);
            const lon = parseFloat(longitude_deg);
            if (isNaN(lat) || isNaN(lon)) continue;
            // Get better country and region information
            const countryInfo = countriesData[iso_country] || {};
            const countryName = countryInfo.name || getCountryName(iso_country);
            const continent = countryInfo.continent || getContinentFromCountry(iso_country);
            // Try to extract region code from municipality or use a default
            let regionCode = null;
            let regionName = null;
            // Look for region information in the municipality field or use regions data
            if (municipality && regionsData[municipality]) {
              regionName = regionsData[municipality];
              regionCode = municipality;
            }
            airfields.push({
              id: crypto.randomUUID(),
              our_airports_id: parseInt(id) || Math.floor(Math.random() * 10000),
              name: name || 'Unknown Airport',
              icao_code: icao_code || null,
              iata_code: iata_code || null,
              type: mappedType as 'airport' | 'heliport' | 'seaplane_base' | 'closed',
              latitude: lat,
              longitude: lon,
              elevation_ft: elevation_ft ? parseInt(elevation_ft) : null,
              continent: continent,
              country_code: iso_country,
              country_name: countryName,
              region_code: regionCode,
              region_name: regionName,
              municipality: municipality || null,
              scheduled_service: scheduled_service === 'yes', // Use the actual scheduled_service field
              gps_code: gps_code || null,
              local_code: local_code || null,
              home_link: home_link || null,
              wikipedia_link: wikipedia_link || null,
              keywords: keywords || null,
              is_active: 1,
              created_at: now,
              updated_at: now
            });
            processedCount++;
            // No limit - import all available airfields
          }
        }
        console.log(`[IMPORT] Matched airfields for ${countryCode}: ${matchCount}`);
        console.log(`[IMPORT] Parsed airfields for ${countryCode}: ${airfields.length}`);
        console.log(`[IMPORT] First 5 parsed airfields:`, airfields.slice(0, 5));
        console.log(`✅ Found ${airfields.length} real airfields for ${countryCode}`);
        return airfields;
      } catch (error) {
        console.error(`❌ Error fetching OurAirports data for ${countryCode}:`, error);
        throw new Error(`Failed to fetch OurAirports data for ${countryCode}: ${error.message}`);
      }
    }
    
    // Helper function to parse CSV lines with quoted fields
    function parseCSVLine(line: string): string[] {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result;
    }
    
    // Helper function to get continent from country code
    function getContinentFromCountry(countryCode: string): string {
      const continentMap: { [key: string]: string } = {
        'RO': 'EU', 'GB': 'EU', 'DE': 'EU', 'FR': 'EU', 'IT': 'EU', 'ES': 'EU', 'CH': 'EU', 'AT': 'EU',
        'US': 'NA', 'CA': 'NA', 'MX': 'NA',
        'BR': 'SA', 'AR': 'SA', 'CL': 'SA',
        'AU': 'OC', 'NZ': 'OC',
        'ZA': 'AF', 'EG': 'AF', 'NG': 'AF',
        'CN': 'AS', 'JP': 'AS', 'IN': 'AS', 'KR': 'AS'
      };
      return continentMap[countryCode] || 'EU';
    }
    
    // Helper function to get country name from country code
    function getCountryName(countryCode: string): string {
      const countryMap: { [key: string]: string } = {
        'RO': 'Romania', 'GB': 'United Kingdom', 'DE': 'Germany', 'FR': 'France',
        'IT': 'Italy', 'ES': 'Spain', 'CH': 'Switzerland', 'AT': 'Austria', 'US': 'United States', 'CA': 'Canada',
        'MX': 'Mexico', 'BR': 'Brazil', 'AR': 'Argentina', 'CL': 'Chile',
        'AU': 'Australia', 'NZ': 'New Zealand', 'ZA': 'South Africa',
        'EG': 'Egypt', 'NG': 'Nigeria', 'CN': 'China', 'JP': 'Japan',
        'IN': 'India', 'KR': 'South Korea'
      };
      return countryMap[countryCode] || countryCode;
    }
    
    // Real OurAirports data only - no mock data fallback
    // All data comes from: https://davidmegginson.github.io/ourairports-data/
    // This function is no longer used as we fetch real data exclusively
    function getEnhancedMockData(countryCode: string) {
      return [];
    }
    
    // Insert all airfields in batches
    const batchSize = 100;
    console.log(`📦 Starting database insertion of ${allAirfields.length} airfields in batches of ${batchSize}`);
    
    for (let i = 0; i < allAirfields.length; i += batchSize) {
      const batch = allAirfields.slice(i, i + batchSize);
      
      for (const airfield of batch) {
        try {
          await c.env.DB.prepare(`
            INSERT OR REPLACE INTO imported_airfields (
              id, our_airports_id, name, icao_code, iata_code, type, latitude, longitude,
              elevation_ft, continent, country_code, country_name, region_code, region_name,
              municipality, scheduled_service, gps_code, local_code, home_link, wikipedia_link, keywords,
              is_active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            airfield.id, airfield.our_airports_id, airfield.name, airfield.icao_code,
            airfield.iata_code, airfield.type, airfield.latitude, airfield.longitude,
            airfield.elevation_ft, airfield.continent, airfield.country_code,
            airfield.country_name, airfield.region_code, airfield.region_name,
            airfield.municipality, airfield.scheduled_service, airfield.gps_code || null,
            airfield.local_code || null, airfield.home_link || null, airfield.wikipedia_link || null,
            airfield.keywords || null, airfield.is_active, airfield.created_at, airfield.updated_at
          ).run();
        } catch (dbError) {
          console.error(`❌ Database insertion error for airfield ${airfield.name}:`, dbError);
          console.error(`❌ Airfield data:`, airfield);
          throw new Error(`Database insertion failed for airfield ${airfield.name}: ${dbError.message}`);
        }
      }
      
      console.log(`📦 Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allAirfields.length / batchSize)}`);
    }
    
    // Update import job status
    await c.env.DB.prepare(`
      UPDATE import_jobs SET status = 'completed', total_records = ?, processed_records = ?, completed_at = ?
      WHERE id = ?
    `).bind(allAirfields.length, totalProcessed, new Date().toISOString(), jobId).run();
    
    return c.json({ 
      message: 'Airfields imported successfully from OurAirports',
      jobId,
      importedCount: allAirfields.length,
      countriesProcessed: countryCodes.length
    });
    
  } catch (error) {
    // Update import job status on error
    await c.env.DB.prepare(`
      UPDATE import_jobs SET status = 'failed', error_message = ?, completed_at = ?
      WHERE id = ?
    `).bind(error.message, new Date().toISOString(), jobId).run();
    
    return c.json({ error: 'Import failed', details: error.message }, 500);
  }
});

// Base Designations endpoints
app.post('/api/superadmin/bases', superadminMiddleware, async (c) => {
  const data = await c.req.json();
  const now = new Date().toISOString();
  
  console.log('🔍 Base designation request data:', data);
  
  // Handle both creating and updating base designations
  if (data.isBase) {
    // Check if a base designation already exists for this airfield
    const existingBase = await c.env.DB.prepare(`
      SELECT id FROM base_designations 
      WHERE airfield_id = ? AND is_active = 1
    `).bind(data.airfieldId).first();
    
    const baseName = data.airfieldName || 'Company Base';
    
    if (existingBase) {
      // Update existing base designation
      await c.env.DB.prepare(`
        UPDATE base_designations 
        SET base_name = ?, description = ?, base_manager = ?, notes = ?, image_url = ?, updated_at = ?
        WHERE id = ?
      `).bind(
        baseName,
        data.baseDescription?.trim() || null, 
        data.baseManager?.trim() || null, 
        data.baseNotes?.trim() || null, 
        data.imageUrl || null,
        now,
        existingBase.id
      ).run();
    } else {
      // Create new base designation
      const id = crypto.randomUUID();
      await c.env.DB.prepare(`
        INSERT INTO base_designations (id, airfield_id, base_name, description, base_manager, notes, image_url, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, 
        data.airfieldId, 
        baseName,
        data.baseDescription?.trim() || null, 
        data.baseManager?.trim() || null, 
        data.baseNotes?.trim() || null, 
        data.imageUrl || null,
        1, 
        now, 
        now
      ).run();
    }
  } else {
    // Remove base designation
    await c.env.DB.prepare(`
      UPDATE base_designations 
      SET is_active = 0, updated_at = ? 
      WHERE airfield_id = ? AND is_active = 1
    `).bind(now, data.airfieldId).run();
  }
  
  return c.json({ success: true, message: 'Base designation updated successfully' }, 201);
});

app.put('/api/superadmin/bases/:id', superadminMiddleware, async (c) => {
  const id = c.req.param('id');
  const data = await c.req.json();
  const now = new Date().toISOString();
  
  await c.env.DB.prepare(`
    UPDATE base_designations SET description = ?, base_manager = ?, notes = ?, image_url = ?, is_active = ?, updated_at = ?
    WHERE id = ?
  `).bind(
    data.description, data.baseManager, data.notes, data.imageUrl || null, data.isActive ? 1 : 0, now, id
  ).run();
  
  return c.json({ id, ...data, updated_at: now });
});

app.delete('/api/superadmin/bases/:id', superadminMiddleware, async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM base_designations WHERE id = ?').bind(id).run();
  return c.json({ message: 'Base designation deleted' });
});

// Import Jobs endpoints
app.get('/api/superadmin/import-jobs', superadminMiddleware, async (c) => {
  const jobs = await c.env.DB.prepare(`
    SELECT * FROM import_jobs 
    ORDER BY created_at DESC 
    LIMIT 50
  `).all();
  
  return c.json(jobs.results);
});

app.get('/api/superadmin/import-jobs/:id', superadminMiddleware, async (c) => {
  const id = c.req.param('id');
  const job = await c.env.DB.prepare('SELECT * FROM import_jobs WHERE id = ?').bind(id).first();
  
  if (!job) {
    return c.json({ error: 'Import job not found' }, 404);
  }
  
  return c.json(job);
});

export default app; 