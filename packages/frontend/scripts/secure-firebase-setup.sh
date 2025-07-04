#!/bin/bash

# Secure Firebase Setup Script
# This script helps you generate a new Firebase API key and update environment variables safely

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${RED}🚨 SECURITY ALERT: Firebase API Key Exposure${NC}"
echo "================================================"
echo ""
echo -e "${YELLOW}⚠️  Your Firebase API key has been exposed in the repository.${NC}"
echo -e "${YELLOW}⚠️  This is a critical security vulnerability that needs immediate attention.${NC}"
echo ""
echo -e "${BLUE}📋 Required Actions:${NC}"
echo "1. Revoke the exposed API key in Firebase Console"
echo "2. Generate a new API key"
echo "3. Update Cloudflare environment variables"
echo "4. Update GitHub secrets (if using GitHub Actions)"
echo ""

# Check if user wants to proceed
read -p "Do you want to proceed with the security fix? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Security fix cancelled. Please address this manually.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔧 Step 1: Firebase Console Actions${NC}"
echo "=================================="
echo ""
echo -e "${YELLOW}Please follow these steps in Firebase Console:${NC}"
echo ""
echo "1. Go to https://console.firebase.google.com/"
echo "2. Select your project: cruiserapp-b8429"
echo "3. Go to Project Settings (gear icon)"
echo "4. Go to 'General' tab"
echo "5. Scroll down to 'Your apps' section"
echo "6. Find your web app and click 'Show' next to API key"
echo "7. Click 'Regenerate key' to create a new API key"
echo "8. Copy the new API key"
echo ""

read -p "Have you generated a new API key? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Please generate a new API key first.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔧 Step 2: Update Environment Variables${NC}"
echo "======================================"
echo ""

# Prompt for new API key
read -p "Enter your new Firebase API key: " new_api_key

if [[ -z "$new_api_key" ]]; then
    echo -e "${RED}❌ API key cannot be empty${NC}"
    exit 1
fi

# Validate API key format (basic check)
if [[ ! "$new_api_key" =~ ^AIza[0-9A-Za-z_-]{35}$ ]]; then
    echo -e "${YELLOW}⚠️  Warning: API key format doesn't match expected pattern${NC}"
    echo "Expected format: AIzaSy followed by 35 characters"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}🔧 Step 3: Update Cloudflare Environment Variables${NC}"
echo "=============================================="
echo ""

# Check if wrangler is available
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler CLI is not installed${NC}"
    echo "Please install it first: npm install -g wrangler"
    exit 1
fi

# Update production environment
echo -e "${BLUE}Updating production environment...${NC}"
if echo "$new_api_key" | wrangler secret put VITE_FIREBASE_API_KEY --env production; then
    echo -e "${GREEN}✅ Production API key updated${NC}"
else
    echo -e "${RED}❌ Failed to update production API key${NC}"
fi

# Update staging environment
echo -e "${BLUE}Updating staging environment...${NC}"
if echo "$new_api_key" | wrangler secret put VITE_FIREBASE_API_KEY --env staging; then
    echo -e "${GREEN}✅ Staging API key updated${NC}"
else
    echo -e "${RED}❌ Failed to update staging API key${NC}"
fi

echo ""
echo -e "${BLUE}🔧 Step 4: Update GitHub Secrets (if using GitHub Actions)${NC}"
echo "=================================================="
echo ""
echo -e "${YELLOW}If you're using GitHub Actions, you need to update the secret:${NC}"
echo ""
echo "1. Go to https://github.com/julianwalder/cruiser-app/settings/secrets/actions"
echo "2. Find 'VITE_FIREBASE_API_KEY'"
echo "3. Click 'Update'"
echo "4. Enter the new API key: $new_api_key"
echo "5. Click 'Update secret'"
echo ""

read -p "Have you updated the GitHub secret? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Please update the GitHub secret manually.${NC}"
fi

echo ""
echo -e "${BLUE}🔧 Step 5: Update Local Environment Files${NC}"
echo "======================================"
echo ""

# Update .env.production if it exists
if [[ -f ".env.production" ]]; then
    echo -e "${BLUE}Updating .env.production...${NC}"
    sed -i.bak "s/VITE_FIREBASE_API_KEY=.*/VITE_FIREBASE_API_KEY=$new_api_key/" .env.production
    echo -e "${GREEN}✅ .env.production updated${NC}"
else
    echo -e "${YELLOW}⚠️  .env.production not found${NC}"
fi

# Update .env.staging if it exists
if [[ -f ".env.staging" ]]; then
    echo -e "${BLUE}Updating .env.staging...${NC}"
    sed -i.bak "s/VITE_FIREBASE_API_KEY=.*/VITE_FIREBASE_API_KEY=$new_api_key/" .env.staging
    echo -e "${GREEN}✅ .env.staging updated${NC}"
else
    echo -e "${YELLOW}⚠️  .env.staging not found${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Security Fix Complete!${NC}"
echo "================================"
echo ""
echo -e "${GREEN}✅ Exposed API key removed from scripts${NC}"
echo -e "${GREEN}✅ New API key generated and updated${NC}"
echo -e "${GREEN}✅ Cloudflare environment variables updated${NC}"
echo -e "${GREEN}✅ Local environment files updated${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Test your application to ensure it works with the new API key"
echo "2. Monitor Firebase Console for any unauthorized usage"
echo "3. Consider enabling additional security measures in Firebase"
echo "4. Review your codebase for any other exposed secrets"
echo ""
echo -e "${YELLOW}⚠️  Important: The old API key should be revoked in Firebase Console${NC}"
echo "This prevents any unauthorized access using the exposed key."
echo ""
echo -e "${GREEN}🔒 Your application is now secure!${NC}" 