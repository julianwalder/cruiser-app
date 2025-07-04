# Firebase Setup Guide for Cruiser Aviation Platform

This guide will help you set up Firebase authentication and services for the Cruiser Aviation Platform using your Firebase JSON key file.

## Prerequisites

- Firebase project created in the [Firebase Console](https://console.firebase.google.com/)
- Firebase service account JSON key file downloaded
- `jq` command-line tool installed (for JSON parsing)

### Installing jq

**macOS:**
```bash
brew install jq
```

**Ubuntu/Debian:**
```bash
sudo apt-get install jq
```

**CentOS/RHEL:**
```bash
sudo yum install jq
```

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "cruiser-aviation")
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create project"

### 1.2 Enable Authentication
1. In your Firebase project, go to "Authentication" → "Sign-in method"
2. Enable the following providers:
   - **Email/Password** (for magic links)
   - **Google** (for OAuth)
3. Configure authorized domains for your production domain

### 1.3 Create Service Account
1. Go to "Project settings" → "Service accounts"
2. Click "Generate new private key"
3. Download the JSON file (keep this secure!)
4. This file contains your Firebase Admin SDK credentials

### 1.4 Enable Cloud Storage (Optional)
1. Go to "Storage" in Firebase Console
2. Click "Get started"
3. Choose a location for your storage bucket
4. Set up security rules for file uploads

## Step 2: Using the Setup Script

### 2.1 Run the Firebase Setup Script
```bash
# Make sure you're in the project root
cd /path/to/cruiser_app

# Run the setup script with your JSON file
./scripts/setup-firebase.sh /path/to/your/firebase-key.json
```

### 2.2 What the Script Does
The setup script will:
- Extract Firebase configuration from your JSON file
- Update `packages/backend/.env` with Admin SDK credentials
- Update `packages/frontend/.env` with client-side config
- Create `.env.production` with all necessary environment variables
- Validate that required fields are present

### 2.3 Manual Setup (Alternative)
If you prefer to set up manually, follow these steps:

#### Backend Configuration (`packages/backend/.env`)
```bash
# Firebase Admin SDK (from your JSON file)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

#### Frontend Configuration (`packages/frontend/.env`)
```bash
# Firebase Client SDK
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## Step 3: Firebase Configuration Details

### 3.1 Backend Firebase Admin SDK
The backend uses Firebase Admin SDK for:
- User authentication verification
- Custom token generation
- User management
- Cloud Storage operations

**Required fields from JSON:**
- `project_id`: Your Firebase project ID
- `private_key`: The private key for service account
- `client_email`: Service account email

### 3.2 Frontend Firebase Client SDK
The frontend uses Firebase Client SDK for:
- User authentication (magic links, Google OAuth)
- Real-time database (if used)
- Cloud Storage uploads
- Push notifications

**Required fields from JSON:**
- `api_key`: Public API key
- `auth_domain`: Authentication domain
- `project_id`: Project ID
- `storage_bucket`: Storage bucket name
- `messaging_sender_id`: Sender ID for notifications
- `app_id`: Application ID

## Step 4: Security Best Practices

### 4.1 Environment Variables
- Never commit Firebase JSON files to version control
- Use environment variables for all sensitive data
- Rotate service account keys regularly

### 4.2 Firebase Security Rules
Set up proper security rules for your Firebase services:

#### Firestore Rules (if using)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow admins to read all data
    match /{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

#### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload files
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow public read access to certain files
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 4.3 App Check (Recommended)
Enable Firebase App Check for additional security:
1. Go to Firebase Console → App Check
2. Enable App Check for your app
3. Configure reCAPTCHA v3 or DeviceCheck

## Step 5: Testing Firebase Setup

### 5.1 Test Backend Connection
```bash
# Start the backend
cd packages/backend
npm run start:dev

# Check logs for Firebase connection success
```

### 5.2 Test Frontend Authentication
```bash
# Start the frontend
cd packages/frontend
npm run dev

# Try signing in with magic link or Google OAuth
```

### 5.3 Verify Environment Variables
```bash
# Check if all variables are set correctly
grep -E "FIREBASE|VITE_FIREBASE" packages/backend/.env packages/frontend/.env
```

## Step 6: Production Deployment

### 6.1 Update Production Environment
1. Review `.env.production` created by the setup script
2. Update all placeholder values with real credentials
3. Set strong passwords for database and Redis
4. Configure SSL certificates

### 6.2 Deploy to Production
```bash
# Deploy using the deployment script
./scripts/deploy.sh production your-domain.com
```

### 6.3 Verify Production Setup
1. Test authentication flows
2. Verify file uploads work
3. Check notification delivery
4. Monitor Firebase Console for usage

## Troubleshooting

### Common Issues

#### "jq command not found"
Install jq using the commands in the Prerequisites section.

#### "Firebase configuration not found"
Make sure your JSON file contains the required fields. Check the file structure:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

#### "Authentication failed"
- Verify Firebase project ID matches
- Check that authentication providers are enabled
- Ensure authorized domains include your domain

#### "Storage upload failed"
- Verify storage bucket name
- Check storage security rules
- Ensure proper permissions on service account

### Getting Help

1. Check Firebase Console for error logs
2. Review application logs in production
3. Verify environment variables are set correctly
4. Test with Firebase emulators for local development

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Storage](https://firebase.google.com/docs/storage)
- [Firebase Security Rules](https://firebase.google.com/docs/rules) 