#!/bin/bash

# Cruiser Aviation Platform Setup Script
# This script sets up the development environment for the aviation platform

set -e

echo "🚀 Setting up Cruiser Aviation Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js version: $(node -v)"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "npm version: $(npm -v)"
}

# Check if Docker is installed (optional)
check_docker() {
    if command -v docker &> /dev/null; then
        print_success "Docker is available"
        DOCKER_AVAILABLE=true
    else
        print_warning "Docker is not installed. You can still run the application locally."
        DOCKER_AVAILABLE=false
    fi
}

# Install root dependencies
install_root_deps() {
    print_status "Installing root dependencies..."
    npm install
    print_success "Root dependencies installed"
}

# Install backend dependencies
install_backend_deps() {
    print_status "Installing backend dependencies..."
    cd packages/backend
    npm install
    cd ../..
    print_success "Backend dependencies installed"
}

# Install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    cd packages/frontend
    npm install
    cd ../..
    print_success "Frontend dependencies installed"
}

# Setup environment files
setup_env_files() {
    print_status "Setting up environment files..."
    
    # Backend environment
    if [ ! -f packages/backend/.env ]; then
        cp packages/backend/env.example packages/backend/.env
        print_success "Backend .env file created"
    else
        print_warning "Backend .env file already exists"
    fi
    
    # Frontend environment
    if [ ! -f packages/frontend/.env ]; then
        cat > packages/frontend/.env << EOF
VITE_API_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
EOF
        print_success "Frontend .env file created"
    else
        print_warning "Frontend .env file already exists"
    fi
}

# Setup database (if Docker is available)
setup_database() {
    if [ "$DOCKER_AVAILABLE" = true ]; then
        print_status "Setting up database with Docker..."
        docker-compose up -d postgres redis
        print_success "Database services started"
        
        # Wait for database to be ready
        print_status "Waiting for database to be ready..."
        sleep 10
        
        # Run migrations
        print_status "Running database migrations..."
        cd packages/backend
        npm run migration:run || print_warning "Migrations failed - this is normal for first setup"
        cd ../..
    else
        print_warning "Skipping database setup - Docker not available"
        print_status "Please set up PostgreSQL and Redis manually, then run:"
        echo "  cd packages/backend && npm run migration:run"
    fi
}

# Build applications
build_apps() {
    print_status "Building applications..."
    
    # Build backend
    cd packages/backend
    npm run build
    cd ../..
    
    # Build frontend
    cd packages/frontend
    npm run build
    cd ../..
    
    print_success "Applications built successfully"
}

# Main setup function
main() {
    print_status "Starting Cruiser Aviation Platform setup..."
    
    # Check prerequisites
    check_node
    check_npm
    check_docker
    
    # Install dependencies
    install_root_deps
    install_backend_deps
    install_frontend_deps
    
    # Setup environment
    setup_env_files
    
    # Setup database
    setup_database
    
    # Build applications
    build_apps
    
    print_success "🎉 Cruiser Aviation Platform setup completed!"
    echo ""
    echo "Next steps:"
    echo "1. Configure your environment variables in packages/backend/.env and packages/frontend/.env"
    echo "2. Set up Firebase project and update frontend environment variables"
    echo "3. Start the development servers:"
    echo "   - npm run dev (for both frontend and backend)"
    echo "   - or docker-compose up (for full stack with database)"
    echo ""
    echo "Access the application:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend API: http://localhost:3001"
    echo "  API Documentation: http://localhost:3001/api"
    echo ""
}

# Run main function
main "$@" 