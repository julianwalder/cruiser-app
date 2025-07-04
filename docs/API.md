# Cruiser Aviation Platform - API Documentation

## 🔗 Base URL
```
Development: http://localhost:3001/api
Production: https://api.cruiser-aviation.com/api
```

## 🔐 Authentication

All API endpoints require authentication unless specified otherwise. Use JWT tokens in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Getting a JWT Token

1. **Magic Link Authentication**:
   ```bash
   POST /api/auth/magic-link
   Content-Type: application/json
   
   {
     "email": "user@example.com"
   }
   ```

2. **Google OAuth**:
   ```bash
   POST /api/auth/google
   Content-Type: application/json
   
   {
     "idToken": "google-id-token"
   }
   ```

3. **Verify Magic Link**:
   ```bash
   POST /api/auth/verify
   Content-Type: application/json
   
   {
     "token": "magic-link-token"
   }
   ```

## 👥 User Management

### Get Current User
```http
GET /api/users/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student_pilot",
  "status": "active",
  "isFullyVerified": true,
  "hasPPL": false,
  "creditedHours": 45.0,
  "totalFlightHours": 12.5,
  "baseId": "uuid",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Update Current User
```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}
```

### List Users (Admin Only)
```http
GET /api/users?page=1&limit=10&role=student_pilot&status=active
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `role`: Filter by user role
- `status`: Filter by user status
- `search`: Search by name or email

## 📱 Onboarding

### Start Onboarding
```http
POST /api/onboarding/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "hasPPL": false,
  "baseId": "uuid"
}
```

### Upload ID Document
```http
POST /api/onboarding/upload-id
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <file>,
  "documentType": "national_id"
}
```

**Response:**
```json
{
  "id": "uuid",
  "extractedData": {
    "firstName": "John",
    "lastName": "Doe",
    "nationalId": "1234567890123",
    "dateOfBirth": "1990-01-01",
    "address": "123 Main St",
    "city": "Bucharest",
    "region": "Bucuresti",
    "country": "Romania",
    "postalCode": "010000",
    "sex": "M",
    "issuedDate": "2020-01-01",
    "expiryDate": "2030-01-01",
    "issuingAuthority": "Romanian Government",
    "nationality": "Romanian"
  },
  "confidence": 0.95,
  "status": "pending_verification"
}
```

### Upload Medical Certificate
```http
POST /api/onboarding/upload-medical
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <file>
}
```

**Response:**
```json
{
  "id": "uuid",
  "extractedData": {
    "name": "John Doe",
    "certificateNumber": "MED123456",
    "dateOfBirth": "1990-01-01",
    "nationality": "Romanian",
    "examDate": "2023-01-01",
    "issueDate": "2023-01-15",
    "expiryDate": "2025-01-15"
  },
  "confidence": 0.92,
  "status": "pending_verification"
}
```

### Verify Phone Number
```http
POST /api/onboarding/verify-phone
Authorization: Bearer <token>
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "code": "123456"
}
```

### Complete Onboarding
```http
POST /api/onboarding/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentPlan": "full_price",
  "serviceId": "uuid"
}
```

## ✈️ Flight Management

### Create Flight
```http
POST /api/flights
Authorization: Bearer <token>
Content-Type: application/json

{
  "departureTime": "2024-01-01T10:00:00Z",
  "departureAirfield": "LRBS",
  "departureLatitude": 44.5722,
  "departureLongitude": 26.1025,
  "flightType": "training",
  "purpose": "solo",
  "instructorId": "uuid"
}
```

### List Flights
```http
GET /api/flights?page=1&limit=10&status=completed&from=2024-01-01&to=2024-01-31
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `status`: Filter by flight status
- `from`: Start date (ISO format)
- `to`: End date (ISO format)
- `aircraftId`: Filter by aircraft

### Get Flight Details
```http
GET /api/flights/{id}
Authorization: Bearer <token>
```

### Update Flight
```http
PUT /api/flights/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "arrivalTime": "2024-01-01T11:30:00Z",
  "arrivalAirfield": "LRBS",
  "arrivalLatitude": 44.5722,
  "arrivalLongitude": 26.1025,
  "hobbsDeparture": 1234.5,
  "hobbsArrival": 1256.2,
  "notes": "Good flight, practiced landings"
}
```

### Complete Flight
```http
POST /api/flights/{id}/complete
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "hobbsArrivalPhoto": <file>,
  "weatherConditions": "VMC",
  "visibility": "10km",
  "windDirection": "270",
  "windSpeed": "10kt"
}
```

### Verify Flight (Instructor)
```http
POST /api/flights/{id}/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "verified": true,
  "remarks": "Good performance, student ready for solo"
}
```

## 💳 Invoice Management

### Create Invoice
```http
POST /api/invoices
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Flight School Enrollment - PPL Course",
  "amount": 5000.00,
  "type": "b2c",
  "dueDate": "2024-02-01",
  "serviceId": "uuid",
  "installmentNumber": 1,
  "totalInstallments": 4
}
```

### List Invoices
```http
GET /api/invoices?page=1&limit=10&status=due&type=b2c
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `status`: Filter by invoice status
- `type`: Filter by invoice type (b2c/b2b)
- `from`: Start date (ISO format)
- `to`: End date (ISO format)

### Get Invoice Details
```http
GET /api/invoices/{id}
Authorization: Bearer <token>
```

### Mark Invoice as Paid
```http
POST /api/invoices/{id}/mark-paid
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentMethod": "bank_transfer",
  "paymentReference": "TRX123456",
  "paymentDate": "2024-01-15"
}
```

## 🏢 Admin Management

### List All Users (Admin)
```http
GET /api/admin/users?page=1&limit=10&role=student_pilot&baseId=uuid
Authorization: Bearer <token>
```

### Create Base
```http
POST /api/admin/bases
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Bucharest Flight School",
  "description": "Main flight school in Bucharest",
  "address": "123 Aviation Street",
  "city": "Bucharest",
  "region": "Bucuresti",
  "country": "Romania",
  "postalCode": "010000",
  "latitude": 44.5722,
  "longitude": 26.1025,
  "icaoCode": "LRBS",
  "runwayLength": "3500m",
  "runwaySurface": "Asphalt",
  "elevation": "95m",
  "frequency": "118.1 MHz",
  "operatingHours": "06:00-22:00",
  "phone": "+40123456789",
  "email": "info@bucharestflight.com",
  "website": "https://bucharestflight.com",
  "managerId": "uuid"
}
```

### Create Service
```http
POST /api/admin/services
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "PPL Course",
  "description": "Private Pilot License course",
  "type": "flight_school",
  "basePrice": 5000.00,
  "includedHours": 45.0,
  "additionalHourPrice": 120.00,
  "defaultPaymentPlan": "full_price",
  "paymentPlans": {
    "full_price": {
      "installments": 4,
      "months": 6,
      "discount": 0
    },
    "two_installments": {
      "installments": 2,
      "months": 4,
      "discount": 5
    },
    "full_payment": {
      "installments": 1,
      "months": 0,
      "discount": 10
    }
  },
  "baseId": "uuid",
  "durationMonths": 6,
  "validityMonths": 12,
  "requirements": ["Medical Certificate", "ID Document"],
  "includedItems": ["Ground School", "Flight Training", "Exam Fees"],
  "excludedItems": ["Additional Flight Hours", "Study Materials"]
}
```

## 📊 Analytics

### Flight Statistics
```http
GET /api/analytics/flights?from=2024-01-01&to=2024-01-31&baseId=uuid
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalFlights": 150,
  "totalHours": 225.5,
  "averageDuration": 90.2,
  "mostFrequentAircraft": "YR-ABC",
  "mostFrequentInstructor": "John Smith",
  "weatherBreakdown": {
    "VMC": 120,
    "IMC": 30
  },
  "monthlyTrend": [
    {
      "month": "2024-01",
      "flights": 45,
      "hours": 67.5
    }
  ]
}
```

### Revenue Analytics
```http
GET /api/analytics/revenue?from=2024-01-01&to=2024-01-31&baseId=uuid
Authorization: Bearer <token>
```

## 🔔 Notifications

### Send Notification
```http
POST /api/notifications/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "uuid",
  "type": "document_expiry",
  "title": "Document Expiry Warning",
  "message": "Your medical certificate expires in 30 days",
  "channels": ["email", "sms", "push"]
}
```

## 📁 File Management

### Upload File
```http
POST /api/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <file>,
  "category": "documents",
  "metadata": {
    "documentType": "medical_certificate",
    "userId": "uuid"
  }
}
```

### Get File URL
```http
GET /api/files/{id}/url
Authorization: Bearer <token>
```

## 🚨 Error Responses

### Validation Error
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    }
  ]
}
```

### Authentication Error
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

### Authorization Error
```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "Insufficient permissions"
}
```

### Not Found Error
```json
{
  "statusCode": 404,
  "message": "Not Found",
  "error": "Resource not found"
}
```

### Server Error
```json
{
  "statusCode": 500,
  "message": "Internal Server Error",
  "error": "Something went wrong"
}
```

## 📝 Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **File upload endpoints**: 10 requests per minute
- **General endpoints**: 100 requests per minute
- **Admin endpoints**: 50 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🔍 Search and Filtering

Most list endpoints support search and filtering:

### Search Parameters
- `search`: Full-text search across relevant fields
- `q`: Quick search (alias for search)

### Filter Parameters
- Date ranges: `from`, `to`, `date`
- Status filters: `status`, `type`, `role`
- ID filters: `userId`, `baseId`, `aircraftId`
- Boolean filters: `verified`, `active`, `featured`

### Sorting
- `sort`: Field to sort by (e.g., `createdAt`, `name`)
- `order`: Sort order (`asc` or `desc`)

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Example:
```http
GET /api/flights?search=training&status=completed&from=2024-01-01&sort=departureTime&order=desc&page=1&limit=20
```

This comprehensive API documentation provides all the information needed to integrate with the Cruiser Aviation Platform. 