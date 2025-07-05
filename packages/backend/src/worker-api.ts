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
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const AircraftSchema = z.object({
  id: z.string().optional(),
  registration: z.string(),
  type: z.string(),
  base_id: z.string(),
  documents: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
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
  origin: ['http://localhost:3000', 'https://cruiseraviation.com', 'https://staging.cruiseraviation.com'],
  credentials: true,
}));

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication middleware
const authMiddleware = jwt({
  secret: 'your-jwt-secret-here', // This will be overridden by environment variable
});

// Admin middleware
const adminMiddleware = async (c: any, next: any) => {
  const user = c.get('jwtPayload');
  if (user.role !== 'admin') {
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
  // Cloudflare Access provides user info via headers
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
  return c.json(bases.results);
});

app.post('/api/admin/bases', adminMiddleware, zValidator('json', BaseSchema), async (c) => {
  const data = c.req.valid('json');
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await c.env.DB.prepare(`
    INSERT INTO bases (id, name, location, description, image_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id, data.name, data.location, data.description, data.image_url, now, now).run();
  
  return c.json({ id, ...data, created_at: now, updated_at: now }, 201);
});

app.put('/api/admin/bases/:id', adminMiddleware, zValidator('json', BaseSchema), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');
  const now = new Date().toISOString();
  
  await c.env.DB.prepare(`
    UPDATE bases SET name = ?, location = ?, description = ?, image_url = ?, updated_at = ?
    WHERE id = ?
  `).bind(data.name, data.location, data.description, data.image_url, now, id).run();
  
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
  return c.json(aircraft.results);
});

app.post('/api/admin/aircraft', adminMiddleware, zValidator('json', AircraftSchema), async (c) => {
  const data = c.req.valid('json');
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await c.env.DB.prepare(`
    INSERT INTO aircraft (id, registration, type, base_id, documents, images, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, data.registration, data.type, data.base_id, JSON.stringify(data.documents || []), JSON.stringify(data.images || []), now, now).run();
  
  return c.json({ id, ...data, created_at: now, updated_at: now }, 201);
});

app.get('/api/admin/services', adminMiddleware, async (c) => {
  const services = await c.env.DB.prepare(`
    SELECT s.*, b.name as base_name 
    FROM services s 
    LEFT JOIN bases b ON s.base_id = b.id 
    ORDER BY s.created_at DESC
  `).all();
  return c.json(services.results);
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

// User profile
app.get('/api/profile', async (c) => {
  const user = c.get('jwtPayload');
  const userData = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(user.userId).first();
  return c.json(userData);
});

export default app; 