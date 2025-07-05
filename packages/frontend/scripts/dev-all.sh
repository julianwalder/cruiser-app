#!/bin/bash

# Cruiser Aviation - Full Local Development Setup
# This script sets up the complete local development environment

set -e

echo "🚀 Starting Cruiser Aviation Full Local Development Environment"
echo "================================================================"

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
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_warning "Node.js version 18 or higher is recommended. Current version: $(node -v)"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Checking dependencies..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed successfully"
else
    print_status "Dependencies already installed"
fi

# Kill any existing processes on our ports
print_status "Cleaning up existing processes..."
lsof -ti:3000,8787 | xargs kill -9 2>/dev/null || true
sleep 2

# Check if ports are available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_error "Port $port is already in use. Please free up the port and try again."
        exit 1
    fi
}

check_port 3000
check_port 8787

print_success "Ports 3000 and 8787 are available"

# Build the project first
print_status "Building the project..."
npm run build
print_success "Project built successfully"

# Start the development servers
print_status "Starting development servers..."
print_status "API Server will run on: http://localhost:8787"
print_status "Frontend will run on: http://localhost:3000"
print_status "Health check: http://localhost:8787/health"
echo ""

# Start both servers concurrently
print_status "Starting servers with concurrently..."
npm run dev:local

# Note: The script will continue running until manually stopped
# The concurrently command will handle both servers 