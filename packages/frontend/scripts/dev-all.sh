#!/bin/bash

# Cruiser Aviation Platform - Complete Development Environment
# This script starts all necessary services for local development

set -e

echo "🚀 Starting Cruiser Aviation Platform Development Environment"
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}❌ Port $port is already in use${NC}"
        echo -e "${YELLOW}Please stop any services running on port $port and try again${NC}"
        exit 1
    fi
}

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null || true)
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}🔄 Killing processes on port $port...${NC}"
        echo $pids | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

# Check and kill processes on required ports
echo -e "${BLUE}🔍 Checking for port conflicts...${NC}"
kill_port 8787  # API server
kill_port 8788  # Worker dev
kill_port 3000  # Vite dev server

# Wait a moment for processes to fully terminate
sleep 2

# Check if ports are now available
check_port 8787
check_port 8788
check_port 3000

echo -e "${GREEN}✅ Ports are available${NC}"

# Function to start service in background
start_service() {
    local name=$1
    local command=$2
    local port=$3
    
    echo -e "${BLUE}🚀 Starting $name on port $port...${NC}"
    echo -e "${YELLOW}Command: $command${NC}"
    
    # Start the service in background
    eval "$command" &
    local pid=$!
    
    # Wait a moment for service to start
    sleep 3
    
    # Check if service is running
    if kill -0 $pid 2>/dev/null; then
        echo -e "${GREEN}✅ $name started successfully (PID: $pid)${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to start $name${NC}"
        return 1
    fi
}

# Start API server
echo ""
echo -e "${BLUE}📡 Starting Development API Server...${NC}"
if ! start_service "API Server" "npm run api:dev" "8787"; then
    echo -e "${RED}Failed to start API server${NC}"
    exit 1
fi

# Wait for API server to be ready
echo -e "${YELLOW}⏳ Waiting for API server to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:8787/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ API server is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ API server failed to start within 30 seconds${NC}"
        exit 1
    fi
    sleep 1
done

# Start Vite dev server
echo ""
echo -e "${BLUE}🌐 Starting Vite Development Server...${NC}"
if ! start_service "Vite Dev Server" "npm run dev:simple" "3000"; then
    echo -e "${RED}Failed to start Vite dev server${NC}"
    exit 1
fi

# Wait for Vite server to be ready
echo -e "${YELLOW}⏳ Waiting for Vite server to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Vite server is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Vite server failed to start within 30 seconds${NC}"
        exit 1
    fi
    sleep 1
done

# Start Worker dev server (optional)
echo ""
echo -e "${BLUE}⚡ Starting Cloudflare Worker Development Server...${NC}"
echo -e "${YELLOW}Note: Worker dev server is optional for local development${NC}"
read -p "Do you want to start the Worker dev server? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if ! start_service "Worker Dev Server" "cd ../.. && npx wrangler dev --env local --port 8788" "8788"; then
        echo -e "${RED}Failed to start Worker dev server${NC}"
        echo -e "${YELLOW}Continuing without Worker dev server...${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 Development Environment Started Successfully!${NC}"
echo "=========================================================="
echo ""
echo -e "${BLUE}📊 Service Status:${NC}"
echo -e "  • API Server:     ${GREEN}http://localhost:8787${NC}"
echo -e "  • Health Check:   ${GREEN}http://localhost:8787/health${NC}"
echo -e "  • Vite Dev:       ${GREEN}http://localhost:3000${NC}"
if lsof -ti:8788 >/dev/null 2>&1; then
    echo -e "  • Worker Dev:     ${GREEN}http://localhost:8788${NC}"
fi
echo ""
echo -e "${BLUE}🔗 Quick Links:${NC}"
echo -e "  • Frontend:       ${GREEN}http://localhost:3000${NC}"
echo -e "  • API Health:     ${GREEN}http://localhost:8787/health${NC}"
echo -e "  • Magic Link:     ${GREEN}http://localhost:8787/api/auth/magic-link${NC}"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo -e "  • Press Ctrl+C to stop all services"
echo -e "  • Check the terminal output for any errors"
echo -e "  • The frontend will proxy API calls to the backend"
echo ""
echo -e "${BLUE}🔄 Services are running. Press Ctrl+C to stop all services.${NC}"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping all development services...${NC}"
    
    # Kill all background processes
    jobs -p | xargs kill -9 2>/dev/null || true
    
    # Kill processes on specific ports
    kill_port 8787
    kill_port 8788
    kill_port 3000
    
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for user to stop
echo -e "${BLUE}⏳ Waiting for user to stop services (Ctrl+C)...${NC}"
wait 