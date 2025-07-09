// Combined Cloudflare Worker entry point - serves both frontend and API
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { jwt } from 'hono/jwt';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { SignJWT } from 'jose';

// Cloudflare Workers types
type D1Database = any;
type R2Bucket = any;
type KVNamespace = any;

// Types
interface Env {
  // Workers Sites binding for static files
  __STATIC_CONTENT: any;
  
  // Database and storage bindings
  DB: D1Database;
  STORAGE: R2Bucket;
  CACHE: KVNamespace;
  
  // Environment variables
  JWT_SECRET: string;
  CLOUDFLARE_ACCESS_AUD: string;
  VITE_API_URL: string;
  VITE_APP_NAME: string;
  VITE_APP_VERSION: string;
  VITE_ENVIRONMENT: string;
  VITE_DEBUG: string;
  VITE_CLOUDFLARE_ACCESS_AUD: string;
  VITE_CLOUDFLARE_ACCESS_TEAM_DOMAIN: string;
}

// Create Hono app
const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'https://app.cruiseraviation.com', 'https://staging.cruiseraviation.com', 'https://ca-staging.julian-pad.workers.dev'],
  credentials: true,
}));

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API root endpoint (only for /api/ routes)
app.get('/api', (c) => {
  return c.json({ message: 'Cruiser Aviation API', version: '1.0.0' });
});

// Development mode check
const isDevelopment = (c: any) => {
  const origin = c.req.header('Origin');
  const userAgent = c.req.header('User-Agent');
  const host = c.req.header('Host');
  
  return origin?.includes('localhost') || 
         origin?.includes('127.0.0.1') || 
         host?.includes('localhost') || 
         host?.includes('127.0.0.1') ||
         userAgent?.includes('curl') ||
         process.env.NODE_ENV === 'development';
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
  if (isDevelopment(c)) {
    c.set('jwtPayload', getMockUser());
    await next();
    return;
  }

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

// Superadmin middleware
const superadminMiddleware = async (c: any, next: any) => {
  const user = c.get('jwtPayload');
  if (!user || user.role !== 'superadmin') {
    return c.json({ error: 'Superadmin access required' }, 403);
  }
  await next();
};

// File upload helper
async function uploadFile(file: File, env: Env, folder: string): Promise<string> {
  const isDev = true;
  const key = isDev ? `local-storage/${folder}/${Date.now()}-${file.name}` : `${folder}/${Date.now()}-${file.name}`;
  
  await env.STORAGE.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  });
  return key;
}

// Serve local files in development mode
app.get('/api/local-files/:folder/:filename', async (c) => {
  if (!isDevelopment(c)) {
    return c.json({ error: 'Not available in production' }, 404);
  }
  try {
    const folder = c.req.param('folder');
    const filename = c.req.param('filename');
    const key = `local-storage/${folder}/${filename}`;
    
    const object = await c.env.STORAGE.get(key);
    if (!object) {
      return c.json({ error: 'File not found' }, 404);
    }
    
    const contentType = getContentType(filename);
    return new Response(object.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error serving local file:', error);
    return c.json({ error: 'Failed to serve file' }, 500);
  }
});

function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'svg':
      return 'image/svg+xml';
    case 'pdf':
      return 'application/pdf';
    case 'txt':
      return 'text/plain';
    case 'json':
      return 'application/json';
    default:
      return 'application/octet-stream';
  }
}

// Auth routes
app.get('/api/auth/profile', async (c) => {
  if (isDevelopment(c)) {
    const mockUser = getMockUser();
    return c.json({ 
      user: mockUser,
      authenticated: true,
      message: 'Development mode - using mock user'
    });
  }

  const cfAccessJwtAssertion = c.req.header('CF-Access-Jwt-Assertion');
  
  if (!cfAccessJwtAssertion) {
    return c.json({ error: 'No Cloudflare Access token found' }, 401);
  }
  
  try {
    return c.json({ 
      message: 'Authentication handled by Cloudflare Access',
      authenticated: true
    });
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

// Superadmin routes
app.get('/api/superadmin/airfields', authMiddleware, superadminMiddleware, async (c) => {
  try {
    const search = c.req.query('search');
    const country = c.req.query('country');
    const type = c.req.query('type');
    const isBase = c.req.query('isBase');
    const is_base = c.req.query('is_base');
    const baseFilter = c.req.query('baseFilter');

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

    // Add search filter
    if (search) {
      query += ` AND (ia.name LIKE ? OR ia.icao_code LIKE ? OR ia.iata_code LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Add country filter
    if (country) {
      query += ` AND ia.country_code = ?`;
      params.push(country);
    }

    // Add base filter
    if (isBase === 'true' || is_base === 'true' || baseFilter === 'true') {
      query += ` AND bd.id IS NOT NULL`;
    }

    query += ` ORDER BY ia.name ASC`;

    console.log('🔍 Airfields query:', query);
    console.log('🔍 Airfields params:', params);

    const result = await c.env.DB.prepare(query).bind(...params).all();
    
    console.log('🔍 Airfields query result:', {
      count: result.results?.length || 0,
      sample: result.results?.[0],
      allResults: result.results
    });

    return c.json(result.results || []);
  } catch (error) {
    console.error('Error fetching airfields:', error);
    return c.json({ error: 'Failed to fetch airfields' }, 500);
  }
});

app.get('/api/superadmin/import-jobs', authMiddleware, superadminMiddleware, async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT * FROM import_jobs 
      ORDER BY created_at DESC
    `).all();
    
    return c.json(result.results || []);
  } catch (error) {
    console.error('Error fetching import jobs:', error);
    return c.json({ error: 'Failed to fetch import jobs' }, 500);
  }
});

app.get('/api/superadmin/operational-areas', authMiddleware, superadminMiddleware, async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT * FROM operational_areas 
      WHERE is_active = 1 
      ORDER BY name ASC
    `).all();
    
    return c.json(result.results || []);
  } catch (error) {
    console.error('Error fetching operational areas:', error);
    return c.json({ error: 'Failed to fetch operational areas' }, 500);
  }
});

app.get('/api/superadmin/continents', authMiddleware, superadminMiddleware, async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT DISTINCT continent, continent_name 
      FROM countries 
      WHERE is_active = 1 
      ORDER BY continent_name ASC
    `).all();
    
    return c.json(result.results || []);
  } catch (error) {
    console.error('Error fetching continents:', error);
    return c.json({ error: 'Failed to fetch continents' }, 500);
  }
});

app.get('/api/superadmin/countries', authMiddleware, superadminMiddleware, async (c) => {
  try {
    const continent = c.req.query('continent');
    
    let query = `
      SELECT * FROM countries 
      WHERE is_active = 1
    `;
    const params: any[] = [];
    
    if (continent) {
      query += ` AND continent = ?`;
      params.push(continent);
    }
    
    query += ` ORDER BY name ASC`;
    
    const result = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json(result.results || []);
  } catch (error) {
    console.error('Error fetching countries:', error);
    return c.json({ error: 'Failed to fetch countries' }, 500);
  }
});

app.post('/api/superadmin/bases', authMiddleware, superadminMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const { airfieldId, airfieldName, isBase, baseDescription, baseManager, baseNotes, imageUrl } = body;
    
    console.log('🔍 Base designation request:', body);

    if (!airfieldId) {
      return c.json({ error: 'Airfield ID is required' }, 400);
    }

    // Check if base designation already exists
    const existing = await c.env.DB.prepare(`
      SELECT id FROM base_designations 
      WHERE airfield_id = ? AND is_active = 1
    `).bind(airfieldId).first();

    if (existing) {
      // Update existing base designation
      await c.env.DB.prepare(`
        UPDATE base_designations 
        SET base_name = ?, description = ?, base_manager = ?, notes = ?, image_url = ?, updated_at = datetime('now')
        WHERE airfield_id = ? AND is_active = 1
      `).bind(airfieldName, baseDescription || '', baseManager || '', baseNotes || '', imageUrl || null, airfieldId).run();
      
      console.log('✅ Updated existing base designation for airfield:', airfieldId);
    } else {
      // Create new base designation
      await c.env.DB.prepare(`
        INSERT INTO base_designations (airfield_id, base_name, description, base_manager, notes, image_url, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
      `).bind(airfieldId, airfieldName, baseDescription || '', baseManager || '', baseNotes || '', imageUrl || null).run();
      
      console.log('✅ Created new base designation for airfield:', airfieldId);
    }

    return c.json({ success: true, message: 'Base designation updated successfully' });
  } catch (error) {
    console.error('Error updating base designation:', error);
    return c.json({ error: 'Failed to update base designation' }, 500);
  }
});

app.post('/api/superadmin/bases/upload-image', authMiddleware, superadminMiddleware, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return c.json({ error: 'No image file provided' }, 400);
    }

    const key = await uploadFile(file, c.env, 'base-designations');
    const imageUrl = `${c.req.url.split('/api/')[0]}/api/local-files/base-designations/${key.split('/').pop()}`;
    
    return c.json({ success: true, imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    return c.json({ error: 'Failed to upload image' }, 500);
  }
});

app.post('/api/superadmin/continents-countries/populate', authMiddleware, superadminMiddleware, async (c) => {
  try {
    console.log('🔍 Starting continents and countries population from OurAirports data...');
    
    // Fetch countries data from OurAirports
    console.log('🔍 Fetching countries data from OurAirports...');
    const countriesResponse = await fetch('https://davidmegginson.github.io/ourairports-data/countries.csv');
    const countriesText = await countriesResponse.text();
    
    // Parse CSV and insert data
    const lines = countriesText.split('\n').slice(1); // Skip header
    let insertedCount = 0;
    
    for (const line of lines) {
      if (line.trim()) {
        const [code, name, continent] = line.split(',');
        if (code && name) {
          await c.env.DB.prepare(`
            INSERT OR REPLACE INTO countries (code, name, continent, is_active, created_at, updated_at)
            VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))
          `).bind(code.trim(), name.trim(), continent?.trim() || 'Unknown').run();
          insertedCount++;
        }
      }
    }
    
    console.log(`🔍 Inserted ${insertedCount} countries`);
    console.log('✅ Continents and countries populated successfully');
    
    return c.json({ 
      success: true, 
      message: 'Continents and countries populated successfully',
      count: insertedCount
    });
  } catch (error) {
    console.error('Error populating continents and countries:', error);
    return c.json({ error: 'Failed to populate continents and countries' }, 500);
  }
});

// Static file serving for frontend
app.get('*', async (c) => {
  const url = new URL(c.req.url);
  
  // Check if this is a request for a static asset (has file extension)
  const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(url.pathname);
  
  if (hasFileExtension) {
    // Let Workers Sites handle static assets automatically
    return fetch(c.req.url);
  } else {
    // This is likely a SPA route (no file extension)
    // Create a request for index.html
    const indexUrl = new URL(c.req.url);
    indexUrl.pathname = '/index.html';
    
    try {
      const indexResponse = await fetch(indexUrl.toString());
      if (indexResponse.ok) {
        // Return index.html with the original URL's content type
        return new Response(indexResponse.body, {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache',
          },
        });
      }
    } catch (error) {
      console.error('Failed to serve index.html for SPA routing:', error);
    }
    
    // If we can't serve index.html, return 404
    return new Response('Not Found', { status: 404 });
  }
});

export default app; 