# Cruiser Aviation Platform

A comprehensive aviation management platform built with React, TypeScript, and NestJS.

## 🚀 Features

- **User Management**: Role-based access control (Admin, User, Super Admin, Base Manager)
- **ID Verification**: Integrated Veriff verification system
- **Service Management**: Flight school services, aircraft rental, instruction
- **Base Management**: Aviation bases and facilities
- **Fleet Management**: Aircraft inventory and management
- **Unified Dashboard**: Role-based dashboard with consistent UI/UX
- **Onboarding System**: Step-by-step user onboarding with ID verification

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Context API** for state management

### Backend
- **NestJS** with TypeScript
- **TypeORM** for database management
- **PostgreSQL** database
- **JWT** authentication
- **File upload** handling

### External Integrations
- **Veriff** for ID verification
- **Firebase** for authentication (optional)

## 📁 Project Structure

```
cruiser_app/
├── packages/
│   ├── frontend/          # React frontend application
│   │   ├── src/
│   │   │   ├── components/    # Reusable components
│   │   │   ├── pages/         # Page components
│   │   │   ├── store/         # State management
│   │   │   ├── services/      # API services
│   │   │   └── types/         # TypeScript types
│   │   └── public/        # Static assets
│   └── backend/           # NestJS backend application
│       ├── src/
│       │   ├── modules/       # Feature modules
│       │   ├── common/        # Shared utilities
│       │   └── config/        # Configuration files
│       └── uploads/       # File uploads
├── docs/                  # Documentation
├── scripts/              # Build and deployment scripts
└── docker-compose.yml    # Docker configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cruiser_app
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd packages/frontend
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend
   cd packages/backend
   cp env.example .env
   # Edit .env with your database and API keys
   
   # Frontend
   cd ../frontend
   cp .env.example .env
   # Edit .env with your API URL
   ```

4. **Set up the database**
   ```bash
   cd packages/backend
   npm run migration:run
   ```

5. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   cd packages/backend
   npm run start:dev
   
   # Terminal 2 - Frontend
   cd packages/frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=cruiser_aviation

# JWT
JWT_SECRET=your_jwt_secret

# Veriff
VERIFF_PUBLIC_KEY=your_veriff_public_key
VERIFF_PRIVATE_KEY=your_veriff_private_key
VERIFF_WEBHOOK_SECRET=your_webhook_secret

# Firebase (optional)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_VERIFF_PUBLIC_KEY=your_veriff_public_key
```

## 📚 API Documentation

The API documentation is available at `http://localhost:3001/api` when the backend is running.

### Key Endpoints

- `POST /api/auth/magic-link` - Send magic link for authentication
- `GET /api/auth/profile` - Get user profile
- `POST /api/veriff/create-session` - Create Veriff verification session
- `GET /api/admin/services` - Get services (admin)
- `GET /api/admin/bases` - Get bases (admin)

## 🏗 Development

### Available Scripts

#### Backend
```bash
npm run start:dev      # Start development server
npm run build          # Build for production
npm run start:prod     # Start production server
npm run migration:run  # Run database migrations
npm run migration:generate  # Generate new migration
```

#### Frontend
```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
```

### Code Style

The project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety

## 🐳 Docker

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support, email support@cruiseraviation.com or create an issue in this repository.

## 🔗 Links

- [Live Demo](https://cruiseraviation.com)
- [API Documentation](https://api.cruiseraviation.com)
- [Issue Tracker](https://github.com/your-org/cruiser-aviation/issues) 