import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

// Mock environment interface
interface MockEnv {
  JWT_SECRET: string;
  CLOUDFLARE_ACCESS_AUD: string;
}

// Create Hono app
const app = new Hono<{ Bindings: MockEnv }>();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'https://app.cruiseraviation.com', 'https://staging.cruiseraviation.com'],
  credentials: true,
}));

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString(), mode: 'mock' });
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
  await next();
};

// Admin middleware
const adminMiddleware = async (c: any, next: any) => {
  const user = c.get('jwtPayload');
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return c.json({ error: 'Admin access required' }, 403);
  }
  await next();
};

// Routes
app.get('/', (c) => {
  return c.json({ message: 'Cruiser Aviation API (Mock Mode)', version: '1.0.0' });
});

// Auth routes
app.get('/api/auth/profile', async (c) => {
  const mockUser = getMockUser();
  return c.json({ 
    user: mockUser,
    authenticated: true,
    message: 'Mock mode - using mock user'
  });
});

// Protected routes
app.use('/api/*', authMiddleware);

// Mock data
const mockUsers = [
  {
    id: '1',
    email: 'admin@cruiseraviation.com',
    name: 'Admin User',
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'user@cruiseraviation.com',
    name: 'Regular User',
    role: 'user',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  }
];

const mockBases = [
  {
    id: '1',
    name: 'Main Base',
    location: 'London, UK',
    description: 'Primary operating base',
    imageUrl: '',
    isActive: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Secondary Base',
    location: 'Manchester, UK',
    description: 'Secondary operating base',
    imageUrl: '',
    isActive: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  }
];

const mockAircraft = [
  {
    id: '1',
    callSign: 'G-ABCD',
    type: 'Cessna 172',
    manufacturer: 'Cessna',
    model: '172 Skyhawk',
    seats: 4,
    maxRange: 800,
    cruiseSpeed: 120,
    fuelCapacity: 200,
    yearManufactured: 2020,
    description: 'Single engine aircraft',
    isActive: true,
    baseId: '1',
    imageUrl: '',
    totalFlightHours: 500,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    base_name: 'Main Base'
  },
  {
    id: '2',
    callSign: 'G-EFGH',
    type: 'Piper PA-28',
    manufacturer: 'Piper',
    model: 'PA-28 Cherokee',
    seats: 4,
    maxRange: 750,
    cruiseSpeed: 130,
    fuelCapacity: 180,
    yearManufactured: 2019,
    description: 'Single engine aircraft',
    isActive: true,
    baseId: '2',
    imageUrl: '',
    totalFlightHours: 300,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    base_name: 'Secondary Base'
  }
];

// Admin routes
app.get('/api/admin/users', adminMiddleware, async (c) => {
  return c.json(mockUsers);
});

app.get('/api/admin/bases', adminMiddleware, async (c) => {
  return c.json(mockBases);
});

app.get('/api/admin/aircraft', adminMiddleware, async (c) => {
  return c.json(mockAircraft);
});

// Superadmin routes
app.get('/api/superadmin/operational-areas', adminMiddleware, async (c) => {
  return c.json([
    { id: '1', name: 'London Area', country: 'UK', isActive: true },
    { id: '2', name: 'Manchester Area', country: 'UK', isActive: true }
  ]);
});

app.get('/api/superadmin/airfields', adminMiddleware, async (c) => {
  const type = c.req.query('type');
  return c.json([
    { id: '1', name: 'London Heathrow', type: 'international', country: 'UK' },
    { id: '2', name: 'Manchester Airport', type: 'international', country: 'UK' },
    { id: '3', name: 'London City Airport', type: 'domestic', country: 'UK' }
  ]);
});

app.get('/api/superadmin/import-jobs', adminMiddleware, async (c) => {
  return c.json([
    { id: '1', status: 'completed', type: 'airports', created_at: '2024-01-01T00:00:00Z' },
    { id: '2', status: 'pending', type: 'airfields', created_at: '2024-01-02T00:00:00Z' }
  ]);
});

// Export the app
export default app; 