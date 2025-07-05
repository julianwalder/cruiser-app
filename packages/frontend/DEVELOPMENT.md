# Fast Development Workflow

## 🚀 Quick Start (Recommended)

This new workflow bypasses the complex Worker setup for much faster development:

### 1. Setup Development Environment
```bash
npm run dev:setup
```

### 2. Start Fast API Server
```bash
npm run api:dev
```
This starts a simple Express.js server with mock data at `http://localhost:8787`

### 3. Start Frontend Development Server
```bash
npm run dev:simple
```
This starts Vite dev server at `http://localhost:3000`

## 🎯 Benefits

- **⚡ Instant reloads** - No Worker rebuilds needed
- **🔧 Easy debugging** - Standard Node.js/Express debugging
- **📊 Mock data** - Pre-configured test data
- **🚫 No build delays** - Direct TypeScript compilation
- **🛠️ Simple setup** - No complex environment configuration

## 📊 Available Endpoints

The development API provides these endpoints:

- `GET /health` - Health check
- `GET /api/info` - App information
- `POST /api/auth/magic-link` - Magic link generation
- `GET /api/auth/verify` - Token verification
- `GET /api/auth/profile` - User profile (mock admin)
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/services` - Services list
- `GET /api/admin/bases` - Bases list
- `GET /api/admin/aircraft` - Aircraft list
- `GET /api/users` - Users list

## 🔄 Migration to Production

When ready for production testing:

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Start the Worker:**
   ```bash
   npm run worker:dev
   ```

3. **Deploy to Cloudflare:**
   ```bash
   npm run worker:deploy
   ```

## 🛠️ Customization

### Adding Mock Data
Edit `scripts/dev-api.js` to add more mock data or endpoints.

### Environment Variables
The development server uses the same environment variables as the Worker, but with mock implementations.

### Database Integration
For real database testing, you can modify the development API to connect to your D1 database:

```javascript
// In scripts/dev-api.js
const { D1Database } = require('@cloudflare/workers-types');

// Replace mock data with real database queries
const services = await env.DB.prepare('SELECT * FROM services').all();
```

## 🐛 Troubleshooting

### Port Already in Use
If port 8787 is busy:
```bash
PORT=8788 npm run api:dev
```

### Frontend Build Issues
If you need to test the Worker build:
```bash
npm run worker:dev
```

### Environment Issues
Reset the development environment:
```bash
npm run dev:setup
``` 