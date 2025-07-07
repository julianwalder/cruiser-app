import express from 'express';
import cors from 'cors';
import { jwtVerify } from 'jose';

const app = express();
const PORT = process.env.PORT || 8787;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// User roles enum
const UserRole = {
  USER: 'user',
  INSTRUCTOR: 'instructor',
  BASEMANAGER: 'basemanager',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
};

// Mock user database (in production, this would be your D1 database)
const users = new Map();

// Cloudflare Access configuration
const CLOUDFLARE_CONFIG = {
  jwtSecret: process.env.JWT_SECRET || 'your-cloudflare-access-jwt-secret-here',
  audience: process.env.VITE_CLOUDFLARE_ACCESS_AUD || '6b4d0d3de1d87066e75cec1738226f04328a9bc72d6bb4e91e6e57e67e41edf3',
  teamDomain: process.env.VITE_CLOUDFLARE_ACCESS_TEAM_DOMAIN || 'cruiseraviation.cloudflareaccess.com',
};

/**
 * Verify Cloudflare Access JWT token
 */
async function verifyCloudflareToken(token) {
  try {
    if (!CLOUDFLARE_CONFIG.jwtSecret || CLOUDFLARE_CONFIG.jwtSecret === 'your-cloudflare-access-jwt-secret-here') {
      console.warn('Cloudflare Access JWT secret not configured');
      return null;
    }

    const secret = new TextEncoder().encode(CLOUDFLARE_CONFIG.jwtSecret);
    
    const { payload } = await jwtVerify(token, secret, {
      issuer: `https://${CLOUDFLARE_CONFIG.teamDomain}`,
      audience: CLOUDFLARE_CONFIG.audience,
    });

    return payload;
  } catch (error) {
    console.error('Failed to verify Cloudflare Access token:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
function extractTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Determine user role from Cloudflare Access groups
 */
function determineUserRole(user) {
  const groups = user.cf?.identity?.groups || [];
  
  // Role hierarchy: superadmin > admin > basemanager > instructor > user
  if (groups.includes('superadmin') || groups.includes('super_admin')) {
    return UserRole.SUPERADMIN;
  }
  if (groups.includes('admin') || groups.includes('administrators')) {
    return UserRole.ADMIN;
  }
  if (groups.includes('basemanager') || groups.includes('base_manager')) {
    return UserRole.BASEMANAGER;
  }
  if (groups.includes('instructor') || groups.includes('flight_instructor')) {
    return UserRole.INSTRUCTOR;
  }
  
  return UserRole.USER;
}

/**
 * Authentication middleware
 */
function createAuthMiddleware(requiredRole = UserRole.USER) {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      const token = extractTokenFromHeader(authHeader);
      
      if (!token) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in to access this resource'
        });
      }

      const user = await verifyCloudflareToken(token);
      if (!user) {
        return res.status(401).json({
          error: 'Invalid token',
          message: 'Authentication token is invalid or expired'
        });
      }

      const userRole = determineUserRole(user);
      
      // Check role hierarchy
      const roleHierarchy = {
        [UserRole.USER]: 1,
        [UserRole.INSTRUCTOR]: 2,
        [UserRole.BASEMANAGER]: 3,
        [UserRole.ADMIN]: 4,
        [UserRole.SUPERADMIN]: 5,
      };

      if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: `This resource requires ${requiredRole} role or higher`,
          userRole: userRole
        });
      }

      // Add user info to request
      req.user = {
        id: user.sub,
        email: user.email,
        name: user.name || user.cf?.identity?.name,
        picture: user.picture,
        role: userRole,
        groups: user.cf?.identity?.groups || [],
        authenticated: true,
      };

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).json({
        error: 'Authentication error',
        message: 'An error occurred during authentication'
      });
    }
  };
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Cruiser Aviation Auth API',
    version: '1.0.0'
  });
});

// Public endpoints
app.get('/api/public/info', (req, res) => {
  res.json({
    message: 'Public information',
    timestamp: new Date().toISOString()
  });
});

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        error: 'Email required',
        message: 'Please provide an email address'
      });
    }

    // In a real implementation, you would:
    // 1. Verify the user exists in your database
    // 2. Create or update user record
    // 3. Return user information

    res.json({
      message: 'Login successful',
      user: {
        email,
        role: UserRole.USER,
        authenticated: true
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
});

// User endpoints (require authentication)
app.get('/api/user/profile', createAuthMiddleware(UserRole.USER), (req, res) => {
  res.json({
    user: req.user,
    message: 'User profile retrieved successfully'
  });
});

app.put('/api/user/profile', createAuthMiddleware(UserRole.USER), (req, res) => {
  res.json({
    user: req.user,
    message: 'User profile updated successfully',
    updatedData: req.body
  });
});

// Instructor endpoints
app.get('/api/instructor/students', createAuthMiddleware(UserRole.INSTRUCTOR), (req, res) => {
  res.json({
    students: [
      { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'active' }
    ],
    instructor: req.user
  });
});

app.post('/api/instructor/students/:id/lesson', createAuthMiddleware(UserRole.INSTRUCTOR), (req, res) => {
  res.json({
    message: 'Lesson scheduled successfully',
    lesson: {
      studentId: req.params.id,
      instructorId: req.user.id,
      date: req.body.date,
      duration: req.body.duration
    }
  });
});

// Base manager endpoints
app.get('/api/basemanager/bases', createAuthMiddleware(UserRole.BASEMANAGER), (req, res) => {
  res.json({
    bases: [
      { id: '1', name: 'Main Base', location: 'City Center', status: 'active' },
      { id: '2', name: 'Secondary Base', location: 'Airport', status: 'active' }
    ],
    manager: req.user
  });
});

app.post('/api/basemanager/bases', createAuthMiddleware(UserRole.BASEMANAGER), (req, res) => {
  res.json({
    message: 'Base created successfully',
    base: {
      id: '3',
      name: req.body.name,
      location: req.body.location,
      createdBy: req.user.id
    }
  });
});

// Admin endpoints
app.get('/api/admin/users', createAuthMiddleware(UserRole.ADMIN), (req, res) => {
  res.json({
    users: [
      { id: '1', email: 'admin@example.com', role: UserRole.ADMIN, status: 'active' },
      { id: '2', email: 'instructor@example.com', role: UserRole.INSTRUCTOR, status: 'active' },
      { id: '3', email: 'user@example.com', role: UserRole.USER, status: 'active' }
    ],
    admin: req.user
  });
});

app.post('/api/admin/users/:id/role', createAuthMiddleware(UserRole.ADMIN), (req, res) => {
  res.json({
    message: 'User role updated successfully',
    user: {
      id: req.params.id,
      role: req.body.role,
      updatedBy: req.user.id
    }
  });
});

// Super admin endpoints
app.get('/api/superadmin/system', createAuthMiddleware(UserRole.SUPERADMIN), (req, res) => {
  res.json({
    system: {
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV
    },
    superAdmin: req.user
  });
});

app.post('/api/superadmin/system/restart', createAuthMiddleware(UserRole.SUPERADMIN), (req, res) => {
  res.json({
    message: 'System restart initiated',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Endpoint ${req.method} ${req.originalUrl} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Authentication API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Cloudflare Access integration enabled`);
  console.log(`👥 Role-based access control active`);
  console.log(`📱 Frontend should run on: http://localhost:3000`);
});

export default app; 