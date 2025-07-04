# Cruiser Aviation Platform - Architecture Documentation

## 🏗️ System Architecture

The Cruiser Aviation Platform is built as a modern, scalable full-stack application with the following architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (NestJS)      │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Firebase      │    │   Redis         │    │   Google Cloud  │
│   Auth          │    │   (Jobs)        │    │   Storage       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📦 Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query
- **Authentication**: Firebase Auth
- **Routing**: React Router DOM
- **UI Components**: Lucide React Icons
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

### Backend
- **Framework**: NestJS with TypeScript
- **Database ORM**: TypeORM
- **Database**: PostgreSQL
- **Authentication**: Firebase Admin SDK + JWT
- **File Storage**: Google Cloud Storage
- **Background Jobs**: Bull + Redis
- **Documentation**: Swagger/OpenAPI
- **Validation**: Class Validator
- **Testing**: Jest

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Database**: PostgreSQL 15
- **Cache/Jobs**: Redis 7
- **Cloud Services**: Firebase, Google Cloud Platform
- **Third-party APIs**: SmartBill, OpenAI, Twilio

## 🗄️ Database Schema

### Core Entities

#### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  phone_number VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  national_id VARCHAR,
  date_of_birth DATE,
  address TEXT,
  city VARCHAR,
  region VARCHAR,
  country VARCHAR,
  postal_code VARCHAR,
  nationality VARCHAR,
  sex VARCHAR,
  role user_role DEFAULT 'student_pilot',
  status user_status DEFAULT 'pending',
  
  -- ID Document fields
  id_document_url VARCHAR,
  id_issued_date DATE,
  id_expiry_date DATE,
  id_issuing_authority VARCHAR,
  
  -- Medical Certificate fields
  medical_certificate_url VARCHAR,
  medical_certificate_number VARCHAR,
  medical_exam_date DATE,
  medical_issue_date DATE,
  medical_expiry_date DATE,
  
  -- Verification flags
  is_id_verified BOOLEAN DEFAULT FALSE,
  is_medical_verified BOOLEAN DEFAULT FALSE,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  
  -- PPL specific fields
  has_ppl BOOLEAN DEFAULT FALSE,
  ppl_number VARCHAR,
  ppl_issue_date DATE,
  ppl_expiry_date DATE,
  
  -- Flight school enrollment
  base_id UUID REFERENCES bases(id),
  enrollment_date DATE,
  total_flight_hours DECIMAL(10,2) DEFAULT 0,
  credited_hours DECIMAL(10,2) DEFAULT 0,
  
  -- Firebase integration
  firebase_uid VARCHAR,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);
```

#### Flights
```sql
CREATE TABLE flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Flight details
  flight_number VARCHAR,
  departure_time TIMESTAMP NOT NULL,
  arrival_time TIMESTAMP,
  duration_minutes DECIMAL(10,2) DEFAULT 0,
  
  -- Airfields
  departure_airfield VARCHAR,
  departure_airfield_icao VARCHAR,
  arrival_airfield VARCHAR,
  arrival_airfield_icao VARCHAR,
  
  -- GPS coordinates
  departure_latitude DECIMAL(10,8),
  departure_longitude DECIMAL(11,8),
  arrival_latitude DECIMAL(10,8),
  arrival_longitude DECIMAL(11,8),
  
  -- Hobbs meter readings
  hobbs_departure DECIMAL(10,2),
  hobbs_arrival DECIMAL(10,2),
  hobbs_departure_photo_url VARCHAR,
  hobbs_arrival_photo_url VARCHAR,
  
  -- Aircraft information
  aircraft_id UUID,
  aircraft_registration VARCHAR,
  
  -- Flight status
  status flight_status DEFAULT 'planned',
  
  -- Flight type and purpose
  flight_type VARCHAR,
  purpose VARCHAR,
  
  -- Instructor information
  instructor_id UUID REFERENCES users(id),
  
  -- Weather and conditions
  weather_conditions VARCHAR,
  visibility VARCHAR,
  wind_direction VARCHAR,
  wind_speed VARCHAR,
  
  -- Notes and remarks
  notes TEXT,
  remarks TEXT,
  
  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by VARCHAR,
  verified_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Invoices
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Invoice details
  invoice_number VARCHAR UNIQUE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  vat_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  vat_rate DECIMAL(5,2) DEFAULT 19,
  
  -- Invoice type and status
  type invoice_type DEFAULT 'b2c',
  status invoice_status DEFAULT 'draft',
  
  -- Dates
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  
  -- B2B specific fields
  company_name VARCHAR,
  company_vat VARCHAR,
  company_address TEXT,
  company_reg_number VARCHAR,
  
  -- SmartBill integration
  smartbill_id VARCHAR,
  smartbill_url VARCHAR,
  smartbill_pdf_url VARCHAR,
  
  -- Payment information
  payment_method payment_method,
  payment_reference VARCHAR,
  bank_transaction_id VARCHAR,
  
  -- Flight school specific
  base_id UUID,
  service_id UUID,
  installment_number INTEGER,
  total_installments INTEGER,
  credited_hours DECIMAL(10,2),
  
  -- Notes and remarks
  notes TEXT,
  internal_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Bases
```sql
CREATE TABLE bases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  
  -- Location information
  address TEXT,
  city VARCHAR,
  region VARCHAR,
  country VARCHAR,
  postal_code VARCHAR,
  
  -- GPS coordinates
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  
  -- AIP data
  icao_code VARCHAR,
  iata_code VARCHAR,
  runway_length VARCHAR,
  runway_surface VARCHAR,
  elevation VARCHAR,
  frequency VARCHAR,
  operating_hours VARCHAR,
  
  -- Contact information
  phone VARCHAR,
  email VARCHAR,
  website VARCHAR,
  
  -- Base manager
  manager_id UUID,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Services
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  type service_type NOT NULL,
  
  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,
  discounted_price DECIMAL(10,2),
  vat_rate DECIMAL(5,2) DEFAULT 19,
  
  -- Flight hours
  included_hours DECIMAL(10,2) DEFAULT 45,
  additional_hour_price DECIMAL(10,2),
  
  -- Payment plans
  default_payment_plan payment_plan DEFAULT 'full_price',
  payment_plans JSONB,
  
  -- Base association
  base_id UUID,
  
  -- Duration and validity
  duration_months INTEGER,
  validity_months INTEGER,
  
  -- Requirements and items
  requirements JSONB,
  included_items JSONB,
  excluded_items JSONB,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/magic-link` - Send magic link
- `POST /api/auth/verify` - Verify magic link
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update current user
- `GET /api/users/:id` - Get user by ID (admin)
- `GET /api/users` - List users (admin)

### Onboarding
- `POST /api/onboarding/start` - Start onboarding process
- `POST /api/onboarding/upload-id` - Upload ID document
- `POST /api/onboarding/upload-medical` - Upload medical certificate
- `POST /api/onboarding/verify-phone` - Verify phone number
- `POST /api/onboarding/complete` - Complete onboarding

### Flights
- `POST /api/flights` - Create new flight
- `GET /api/flights` - List user flights
- `GET /api/flights/:id` - Get flight details
- `PUT /api/flights/:id` - Update flight
- `DELETE /api/flights/:id` - Delete flight
- `POST /api/flights/:id/verify` - Verify flight (instructor)

### Invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices` - List user invoices
- `GET /api/invoices/:id` - Get invoice details
- `PUT /api/invoices/:id` - Update invoice
- `POST /api/invoices/:id/mark-paid` - Mark invoice as paid

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/flights` - List all flights
- `GET /api/admin/invoices` - List all invoices
- `POST /api/admin/bases` - Create base
- `PUT /api/admin/bases/:id` - Update base
- `POST /api/admin/services` - Create service
- `PUT /api/admin/services/:id` - Update service

## 🔐 Security

### Authentication Flow
1. **Magic Link**: User enters email → receives magic link → clicks link → authenticated
2. **Google OAuth**: User clicks Google sign-in → redirected to Google → callback → authenticated
3. **JWT Tokens**: Backend issues JWT tokens for API access
4. **Role-based Access**: Different permissions based on user role

### Data Protection
- All sensitive data encrypted at rest
- HTTPS for all communications
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration for frontend

### File Upload Security
- File type validation
- File size limits
- Virus scanning (optional)
- Secure storage in Google Cloud Storage
- Signed URLs for secure access

## 📱 Mobile-First Design

The platform is designed with mobile-first approach:

### Flight Logging
- GPS integration for automatic airfield detection
- Camera integration for hobbs meter photos
- Offline capability for flight data
- Push notifications for reminders

### Responsive Design
- Progressive Web App (PWA) features
- Touch-friendly interface
- Optimized for various screen sizes
- Fast loading times

## 🔄 Background Jobs

### Redis + Bull Queue
- **Document Processing**: OCR and data extraction
- **Invoice Generation**: SmartBill integration
- **Notification Sending**: Email, SMS, push notifications
- **Data Synchronization**: External API updates
- **Cleanup Tasks**: Expired data removal

### Scheduled Tasks
- Document expiry reminders
- Payment due notifications
- System health checks
- Data backups

## 📊 Monitoring & Analytics

### Application Monitoring
- Error tracking and logging
- Performance metrics
- User activity analytics
- API usage statistics

### Business Intelligence
- Flight hour analytics
- Revenue tracking
- Student progress monitoring
- Aircraft utilization

## 🚀 Deployment

### Development
```bash
# Local development
npm run dev

# Docker development
docker-compose up
```

### Production
- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: AWS ECS, Google Cloud Run, or DigitalOcean App Platform
- **Database**: AWS RDS, Google Cloud SQL, or managed PostgreSQL
- **Redis**: AWS ElastiCache or managed Redis service

### Environment Variables
- Database connection strings
- API keys for third-party services
- JWT secrets
- Firebase configuration
- Google Cloud credentials

## 🔧 Development Workflow

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Husky for pre-commit hooks
- Jest for testing

### Git Workflow
- Feature branches
- Pull request reviews
- Automated testing
- Deployment automation

### Database Migrations
- TypeORM migrations
- Version-controlled schema changes
- Rollback capabilities
- Data seeding for development

This architecture provides a solid foundation for a scalable, maintainable aviation management platform that can grow with your business needs. 