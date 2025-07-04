# 🚀 Getting Started with Cruiser Aviation Platform

Welcome to the Cruiser Aviation Platform! This guide will help you set up and run the application for development and production.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **Docker** (optional, for database and Redis) ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

## 🏗️ Project Structure

```
cruiser_app/
├── packages/
│   ├── backend/          # NestJS API server
│   │   ├── src/
│   │   │   ├── modules/  # Feature modules
│   │   │   ├── config/   # Configuration files
│   │   │   ├── database/ # Database entities & migrations
│   │   │   └── utils/    # Utility functions
│   │   └── package.json
│   └── frontend/         # React web application
│       ├── src/
│       │   ├── components/ # Reusable UI components
│       │   ├── pages/      # Page components
│       │   ├── hooks/      # Custom React hooks
│       │   ├── services/   # API services
│       │   ├── store/      # State management
│       │   └── utils/      # Utility functions
│       └── package.json
├── docs/                 # Documentation
├── scripts/              # Setup and deployment scripts
├── docker-compose.yml    # Docker services configuration
└── package.json          # Root package.json
```

## ⚡ Quick Start

### Option 1: Automated Setup (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd cruiser_app
   ```

2. **Run the setup script**:
   ```bash
   ./scripts/setup.sh
   ```

3. **Configure environment variables**:
   - Edit `packages/backend/.env`
   - Edit `packages/frontend/.env`

4. **Start the development servers**:
   ```bash
   npm run dev
   ```

### Option 2: Manual Setup

1. **Install root dependencies**:
   ```bash
   npm install
   ```

2. **Install backend dependencies**:
   ```bash
   cd packages/backend
   npm install
   cd ../..
   ```

3. **Install frontend dependencies**:
   ```bash
   cd packages/frontend
   npm install
   cd ../..
   ```

4. **Set up environment files**:
   ```bash
   cp packages/backend/env.example packages/backend/.env
   # Create packages/frontend/.env manually
   ```

5. **Start the development servers**:
   ```bash
   npm run dev
   ```

## 🔧 Environment Configuration

### Backend Environment (.env)

Create `packages/backend/.env` with the following variables:

```env
# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://cruiser_user:cruiser_password@localhost:5432/cruiser_aviation

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Firebase
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Firebase Private Key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID=your-google-cloud-project-id
GOOGLE_CLOUD_STORAGE_BUCKET=your-storage-bucket-name
GOOGLE_CLOUD_STORAGE_KEY_FILE=path/to/service-account-key.json

# SmartBill
SMARTBILL_API_KEY=your-smartbill-api-key
SMARTBILL_COMPANY_VAT=your-company-vat-number
SMARTBILL_COMPANY_NAME=Your Company Name
SMARTBILL_COMPANY_ADDRESS=Your Company Address

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis (for background jobs)
REDIS_HOST=localhost
REDIS_PORT=6379

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Frontend Environment (.env)

Create `packages/frontend/.env` with the following variables:

```env
VITE_API_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## 🐳 Docker Setup

### Using Docker Compose (Recommended)

1. **Start all services**:
   ```bash
   docker-compose up -d
   ```

2. **View logs**:
   ```bash
   docker-compose logs -f
   ```

3. **Stop services**:
   ```bash
   docker-compose down
   ```

### Individual Services

Start only the database and Redis:
```bash
docker-compose up -d postgres redis
```

## 🗄️ Database Setup

### Using Docker (Recommended)

The database will be automatically set up when using Docker Compose.

### Manual Setup

1. **Install PostgreSQL**:
   ```bash
   # macOS
   brew install postgresql
   
   # Ubuntu
   sudo apt-get install postgresql postgresql-contrib
   ```

2. **Create database**:
   ```bash
   createdb cruiser_aviation
   ```

3. **Run migrations**:
   ```bash
   cd packages/backend
   npm run migration:run
   ```

## 🔥 Firebase Setup

1. **Create a Firebase project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password and Google)
   - Create a web app

2. **Get Firebase configuration**:
   - Go to Project Settings
   - Copy the Firebase config object
   - Update your frontend `.env` file

3. **Set up Firebase Admin SDK**:
   - Go to Project Settings > Service Accounts
   - Generate a new private key
   - Download the JSON file
   - Update your backend `.env` file

## 🚀 Development Commands

### Root Commands
```bash
npm run dev              # Start both frontend and backend
npm run dev:backend      # Start only backend
npm run dev:frontend     # Start only frontend
npm run build            # Build both applications
npm run test             # Run tests
npm run lint             # Run linting
```

### Backend Commands
```bash
cd packages/backend
npm run start:dev        # Start development server
npm run build            # Build for production
npm run test             # Run tests
npm run migration:run    # Run database migrations
npm run migration:generate -- src/migrations/MigrationName  # Generate migration
```

### Frontend Commands
```bash
cd packages/frontend
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run test             # Run tests
```

## 🌐 Accessing the Application

Once everything is running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api
- **Database**: localhost:5432 (if using Docker)

## 📱 Testing the Application

### 1. Create a Test User

1. Go to http://localhost:3000
2. Click "Get Started"
3. Enter your email address
4. Check your email for the magic link
5. Click the magic link to sign in

### 2. Complete Onboarding

1. Upload your ID document
2. Upload your medical certificate
3. Verify your phone number
4. Complete the onboarding process

### 3. Log a Flight

1. Go to the Flights section
2. Click "Log New Flight"
3. Fill in the flight details
4. Submit the flight log

## 🔍 Troubleshooting

### Common Issues

**Port already in use**:
```bash
# Find process using port
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>
```

**Database connection failed**:
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql
sudo systemctl status postgresql

# Start PostgreSQL
brew services start postgresql
sudo systemctl start postgresql
```

**Docker issues**:
```bash
# Reset Docker containers
docker-compose down -v
docker-compose up -d

# Check Docker logs
docker-compose logs backend
docker-compose logs frontend
```

**Node modules issues**:
```bash
# Clear node modules and reinstall
rm -rf node_modules packages/*/node_modules
npm install
```

### Getting Help

1. Check the logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all services are running
4. Check the API documentation at http://localhost:3001/api

## 🚀 Production Deployment

### Environment Variables

Update environment variables for production:

```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
```

### Build for Production

```bash
# Build both applications
npm run build

# Start production servers
npm run start:prod
```

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 Next Steps

1. **Read the Documentation**:
   - [Architecture Guide](docs/ARCHITECTURE.md)
   - [API Documentation](docs/API.md)

2. **Customize the Application**:
   - Update branding and colors
   - Configure email templates
   - Set up custom integrations

3. **Deploy to Production**:
   - Set up a production database
   - Configure SSL certificates
   - Set up monitoring and logging

4. **Contribute to Development**:
   - Follow the coding standards
   - Write tests for new features
   - Submit pull requests

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Consult the documentation
4. Create an issue in the repository

---

**Happy flying! ✈️**

The Cruiser Aviation Platform is now ready to help you manage your flight school operations efficiently and professionally. 