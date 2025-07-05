#!/bin/bash

# Development environment startup script
echo "🚀 Starting Cruiser Aviation Development Environment..."

# Kill any existing processes
echo "🔄 Cleaning up existing processes..."
pkill -f "wrangler dev" 2>/dev/null || true
pkill -f "node scripts/dev-api.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Wait a moment for processes to stop
sleep 2

# Start API server in background
echo "📡 Starting API server on port 8787..."
node scripts/dev-api.js &
API_PID=$!

# Wait for API to start
sleep 3

# Start Vite dev server in background
echo "⚡ Starting Vite dev server on port 3000..."
npm run dev:simple &
VITE_PID=$!

# Wait for Vite to start
sleep 5

# Start Worker in background
echo "🌐 Starting Worker on port 8788..."
npx wrangler dev --env local --port 8788 &
WORKER_PID=$!

# Wait for worker to start
sleep 3

echo ""
echo "✅ Development environment started successfully!"
echo ""
echo "📱 Frontend: http://localhost:8788 (via Worker)"
echo "⚡ Vite Dev: http://localhost:3000 (direct)"
echo "📡 API: http://localhost:8787"
echo ""
echo "🔗 Health checks:"
echo "  - Worker: http://localhost:8788/health"
echo "  - API: http://localhost:8787/health"
echo ""
echo "🛑 To stop all services, run: pkill -f 'wrangler\|dev-api\|vite'"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping development environment..."
    kill $API_PID 2>/dev/null || true
    kill $VITE_PID 2>/dev/null || true
    kill $WORKER_PID 2>/dev/null || true
    exit 0
}

# Trap Ctrl+C and cleanup
trap cleanup SIGINT

# Keep script running
echo "⏳ Press Ctrl+C to stop all services..."
wait 