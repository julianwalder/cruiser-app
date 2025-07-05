# Local Development Guide

This guide will help you set up and run the Cruiser Aviation platform locally for development.

## Prerequisites

- **Node.js** (version 18 or higher recommended)
- **npm** (comes with Node.js)
- **Git** (for version control)

## Quick Start

### Option 1: Full Local Development (Recommended)

This option runs both the frontend and backend API server locally:

```bash
# Navigate to the frontend directory
cd packages/frontend

# Start the full development environment
npm run dev:local
```

This will:
- Start the API server on `http://localhost:8787`
- Start the Vite dev server on `http://localhost:3000`
- Set up API proxying from frontend to backend
- Enable hot reload for both servers

### Option 2: Individual Servers

If you prefer to run servers individually:

```bash
# Terminal 1: Start API server
npm run api:dev

# Terminal 2: Start frontend dev server
npm run dev:simple
```

### Option 3: Using the Setup Script

For a more comprehensive setup with dependency checks:

```bash
# Make sure you're in the frontend directory
cd packages/frontend

# Run the setup script
./scripts/dev-all.sh
```

## What's Running

### API Server (Port 8787)
- **URL**: `http://localhost:8787`
- **Health Check**: `http://localhost:8787/health`
- **Features**:
  - Mock data for all endpoints
  - File upload support (images only)
  - CORS enabled for local development
  - Hot reload on file changes

### Frontend Server (Port 3000)
- **URL**: `http://localhost:3000`
- **Features**:
  - React development server with hot reload
  - API proxying to backend
  - TypeScript compilation
  - Tailwind CSS processing

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:local` | Start both API and frontend servers |
| `npm run api:dev` | Start only the API server |
| `npm run dev:simple` | Start only the frontend server |
| `npm run build` | Build the project for production |
| `npm run dev:full` | Run the comprehensive setup script |

## API Endpoints

The development API server provides mock data for these endpoints:

### Authentication
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/magic-link` - Create magic link (mock)

### Admin Dashboard
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/services` - List services
- `GET /api/admin/bases` - List bases
- `GET /api/admin/aircraft` - List aircraft
- `GET /api/admin/users` - List users

### File Uploads
- `POST /api/admin/services/upload-image` - Upload service image
- `POST /api/admin/bases/upload-image` - Upload base image
- `POST /api/admin/aircraft/upload-image` - Upload aircraft image
- `POST /api/admin/users/upload-image` - Upload user image

### Health & Info
- `GET /health` - Health check
- `GET /api/info` - Application info
- `GET /api/docs` - API documentation

## Development Features

### Hot Reload
Both servers support hot reload:
- Frontend: React components update automatically
- Backend: API server restarts on file changes

### Mock Data
The API server uses in-memory mock data that persists during the session:
- Services, bases, aircraft, and users
- File uploads return data URLs for local testing
- All CRUD operations are supported

### API Proxying
The frontend automatically proxies `/api/*` requests to the backend:
- No CORS issues in development
- Seamless integration between frontend and backend

### File Uploads
Local development supports file uploads:
- Images are converted to data URLs
- Fallback URLs provided for testing
- File size limits: 25MB
- Supported formats: All image types

## Troubleshooting

### Port Already in Use
If you get a "port already in use" error:

```bash
# Kill processes on the required ports
lsof -ti:3000,8787 | xargs kill -9

# Or use the setup script which handles this automatically
./scripts/dev-all.sh
```

### Build Errors
If you encounter build errors:

```bash
# Clean and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild the project
npm run build
```

### API Connection Issues
If the frontend can't connect to the API:

1. Check that the API server is running on port 8787
2. Verify the health check: `curl http://localhost:8787/health`
3. Check the Vite proxy configuration in `vite.config.ts`

### TypeScript Errors
If you see TypeScript errors:

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Fix linting issues
npm run lint:fix
```

## Environment Variables

The development environment uses these default values:

```env
VITE_API_URL=http://localhost:8787
VITE_APP_NAME=Cruiser Aviation (Local)
VITE_ENVIRONMENT=local
VITE_DEBUG=true
```

## Database

For local development, the API server uses in-memory mock data. No database setup is required.

## Authentication

Local development uses mock authentication:
- No real authentication required
- Admin user is automatically logged in
- Magic link endpoints return mock responses

## Next Steps

Once your local development environment is running:

1. Open `http://localhost:3000` in your browser
2. Navigate through the application
3. Test the admin features
4. Try uploading images
5. Check the API endpoints

## Production Deployment

When ready for production:

```bash
# Build the project
npm run build

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

## Support

If you encounter issues:

1. Check the terminal output for error messages
2. Verify all prerequisites are installed
3. Try the troubleshooting steps above
4. Check the project documentation in the `docs/` directory 