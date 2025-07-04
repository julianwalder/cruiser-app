# Veriff Integration Guide

## Overview

Cruiser Aviation Platform integrates with Veriff for secure identity verification during user onboarding. This integration replaces manual document uploads with a professional, compliant verification process.

## Features

- **Secure ID Verification**: Government-issued ID verification (passport, driver's license, national ID)
- **Face Verification**: Live face matching with ID photo
- **Real-time Processing**: Instant verification results
- **Compliance**: GDPR and aviation industry standards compliant
- **Multi-language Support**: Global verification capabilities

## Setup Instructions

### 1. Veriff Account Setup

1. Sign up for a Veriff account at [veriff.com](https://veriff.com)
2. Complete your business verification
3. Get your API credentials:
   - Public Key
   - Private Key
   - Webhook URL

### 2. Environment Configuration

Add the following environment variables to your `.env` file:

```bash
# Veriff Configuration
VERIFF_PUBLIC_KEY=your_veriff_public_key
VERIFF_PRIVATE_KEY=your_veriff_private_key
VERIFF_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Backend Configuration

The Veriff module is already set up in the backend:

- **Module**: `packages/backend/src/modules/veriff/`
- **Service**: Handles session creation and webhook processing
- **Controller**: Provides API endpoints for frontend integration

### 4. Frontend Integration

The Veriff verification component is integrated into the Profile page:

- **Component**: `packages/frontend/src/components/VeriffVerification.tsx`
- **Integration**: First step in the onboarding process
- **Modal**: Available for existing users to complete verification

## API Endpoints

### Create Verification Session
```
POST /api/veriff/create-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01"
}
```

### Get Session Status
```
GET /api/veriff/session/:sessionId/status
Authorization: Bearer <token>
```

### Webhook Endpoint
```
POST /api/veriff/webhook
Content-Type: application/json

{
  "sessionId": "session_123",
  "status": "approved",
  "person": { ... },
  "document": { ... }
}
```

## Usage Flow

### 1. User Onboarding
1. User clicks "Start Verification" in Profile tab
2. Backend creates Veriff session
3. Frontend displays Veriff widget
4. User completes verification process
5. Veriff sends webhook with results
6. User profile is updated with verification status

### 2. Verification Process
1. **ID Document Upload**: User uploads government-issued ID
2. **Face Verification**: User takes live photo for face matching
3. **Processing**: Veriff AI analyzes documents and photos
4. **Result**: Verification status is returned

### 3. Post-Verification
- User profile shows verification status
- Verification data is stored securely
- User can proceed with aviation activities

## Security Considerations

### Data Protection
- All verification data is encrypted in transit
- Personal data is processed according to GDPR requirements
- Verification results are stored securely

### Webhook Security
- Webhook signatures are verified
- HTTPS endpoints only
- Rate limiting on webhook endpoints

### User Privacy
- Users can request data deletion
- Verification data is anonymized where possible
- Clear privacy policy and consent flow

## Testing

### Development Mode
The current implementation includes mock data for development:

1. Start the backend server
2. Navigate to Profile page
3. Click "Start Verification"
4. Mock verification will complete automatically

### Production Testing
1. Set up Veriff sandbox environment
2. Use test documents provided by Veriff
3. Verify webhook processing
4. Test error handling scenarios

## Troubleshooting

### Common Issues

1. **Session Creation Fails**
   - Check API credentials
   - Verify network connectivity
   - Check user authentication

2. **Webhook Not Received**
   - Verify webhook URL configuration
   - Check firewall settings
   - Validate webhook signature

3. **Verification Timeout**
   - Check user's internet connection
   - Verify document quality
   - Ensure proper lighting for face verification

### Logs and Monitoring
- Backend logs include Veriff session details
- Webhook processing is logged
- Error scenarios are captured for debugging

## Future Enhancements

### Planned Features
- **Multi-document Support**: Additional document types
- **Advanced Analytics**: Verification success rates
- **Custom Branding**: White-label verification experience
- **Mobile SDK**: Native mobile app integration

### Integration Options
- **Sumsub Alternative**: Consider Sumsub for additional features
- **Custom Verification**: Build custom verification flow
- **Hybrid Approach**: Combine automated and manual verification

## Support

For technical support:
- Check Veriff documentation: [docs.veriff.com](https://docs.veriff.com)
- Review backend logs for error details
- Contact development team for integration issues

For business inquiries:
- Contact Veriff sales team
- Review pricing and compliance requirements
- Discuss custom integration needs 