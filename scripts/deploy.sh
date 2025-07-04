#!/bin/bash

# Production deployment script for Cruiser Aviation Platform
# This script handles safe deployment with backup and rollback capabilities

set -e

# Configuration
ENVIRONMENT=${1:-production}
DOMAIN=${2:-cruiser-aviation.com}
BACKUP_BEFORE_DEPLOY=true
HEALTH_CHECK_TIMEOUT=300
ROLLBACK_ON_FAILURE=true

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate environment
validate_environment() {
    print_status "Validating deployment environment..."
    
    # Check required commands
    local required_commands=("docker" "docker-compose" "git")
    for cmd in "${required_commands[@]}"; do
        if ! command_exists "$cmd"; then
            print_error "Required command '$cmd' not found"
            exit 1
        fi
    done
    
    # Check environment file
    if [ ! -f ".env.production" ]; then
        print_error "Production environment file (.env.production) not found"
        exit 1
    fi
    
    # Check SSL certificates
    if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
        print_warning "SSL certificates not found. Please add them to nginx/ssl/"
        print_status "You can generate self-signed certificates for testing:"
        echo "mkdir -p nginx/ssl"
        echo "openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx/ssl/key.pem -out nginx/ssl/cert.pem"
    fi
    
    print_success "Environment validation completed"
}

# Function to create backup
create_backup() {
    if [ "$BACKUP_BEFORE_DEPLOY" = true ]; then
        print_status "Creating database backup before deployment..."
        
        # Create backup directory
        mkdir -p backups
        
        # Run backup
        if docker-compose -f docker-compose.prod.yml run --rm backup; then
            print_success "Backup created successfully"
        else
            print_error "Backup failed"
            exit 1
        fi
    fi
}

# Function to stop services
stop_services() {
    print_status "Stopping existing services..."
    
    if docker-compose -f docker-compose.prod.yml down; then
        print_success "Services stopped"
    else
        print_warning "Some services may still be running"
    fi
}

# Function to build images
build_images() {
    print_status "Building Docker images..."
    
    # Build backend
    print_status "Building backend image..."
    if docker-compose -f docker-compose.prod.yml build backend; then
        print_success "Backend image built successfully"
    else
        print_error "Backend build failed"
        exit 1
    fi
    
    # Build frontend
    print_status "Building frontend image..."
    if docker-compose -f docker-compose.prod.yml build frontend; then
        print_success "Frontend image built successfully"
    else
        print_error "Frontend build failed"
        exit 1
    fi
}

# Function to start services
start_services() {
    print_status "Starting services..."
    
    # Start database and Redis first
    print_status "Starting database and Redis..."
    if docker-compose -f docker-compose.prod.yml up -d postgres redis; then
        print_success "Database and Redis started"
    else
        print_error "Failed to start database and Redis"
        exit 1
    fi
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 30
    
    # Run migrations
    print_status "Running database migrations..."
    if docker-compose -f docker-compose.prod.yml run --rm backend npm run migration:run; then
        print_success "Migrations completed"
    else
        print_warning "Migrations failed or already up to date"
    fi
    
    # Start backend
    print_status "Starting backend service..."
    if docker-compose -f docker-compose.prod.yml up -d backend; then
        print_success "Backend started"
    else
        print_error "Backend failed to start"
        exit 1
    fi
    
    # Start frontend
    print_status "Starting frontend service..."
    if docker-compose -f docker-compose.prod.yml up -d frontend; then
        print_success "Frontend started"
    else
        print_error "Frontend failed to start"
        exit 1
    fi
    
    # Start nginx
    print_status "Starting nginx reverse proxy..."
    if docker-compose -f docker-compose.prod.yml up -d nginx; then
        print_success "Nginx started"
    else
        print_error "Nginx failed to start"
        exit 1
    fi
}

# Function to health check
health_check() {
    print_status "Performing health checks..."
    
    local start_time=$(date +%s)
    local timeout=$HEALTH_CHECK_TIMEOUT
    
    while true; do
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        if [ $elapsed -gt $timeout ]; then
            print_error "Health check timeout after ${timeout}s"
            return 1
        fi
        
        # Check backend health
        if curl -f -s http://localhost:3001/api/health > /dev/null 2>&1; then
            print_success "Backend health check passed"
        else
            print_warning "Backend health check failed, retrying..."
            sleep 10
            continue
        fi
        
        # Check frontend health
        if curl -f -s http://localhost/health > /dev/null 2>&1; then
            print_success "Frontend health check passed"
        else
            print_warning "Frontend health check failed, retrying..."
            sleep 10
            continue
        fi
        
        # Check database health
        if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U cruiser_user > /dev/null 2>&1; then
            print_success "Database health check passed"
        else
            print_warning "Database health check failed, retrying..."
            sleep 10
            continue
        fi
        
        print_success "All health checks passed"
        break
    done
}

# Function to rollback
rollback() {
    if [ "$ROLLBACK_ON_FAILURE" = true ]; then
        print_error "Deployment failed, initiating rollback..."
        
        # Stop all services
        docker-compose -f docker-compose.prod.yml down
        
        # Restore from backup if available
        local latest_backup=$(ls -t backups/cruiser_aviation_*.sql.gz 2>/dev/null | head -1)
        if [ -n "$latest_backup" ]; then
            print_status "Restoring from backup: $latest_backup"
            # Note: This would require additional implementation for restore
            print_warning "Manual restore required from: $latest_backup"
        fi
        
        print_error "Rollback completed. Please check logs and fix issues before retrying."
        exit 1
    fi
}

# Function to show deployment info
show_deployment_info() {
    print_success "Deployment completed successfully!"
    echo ""
    echo "🌐 Application URLs:"
    echo "  Frontend: https://$DOMAIN"
    echo "  Backend API: https://$DOMAIN/api"
    echo "  API Documentation: https://$DOMAIN/api"
    echo ""
    echo "📊 Monitoring:"
    echo "  Docker logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "  Backend logs: docker-compose -f docker-compose.prod.yml logs backend"
    echo "  Frontend logs: docker-compose -f docker-compose.prod.yml logs nginx"
    echo ""
    echo "🔧 Management:"
    echo "  Stop services: docker-compose -f docker-compose.prod.yml down"
    echo "  Restart services: docker-compose -f docker-compose.prod.yml restart"
    echo "  View status: docker-compose -f docker-compose.prod.yml ps"
    echo ""
}

# Main deployment function
main() {
    print_status "Starting deployment to $ENVIRONMENT environment..."
    
    # Validate environment
    validate_environment
    
    # Create backup
    create_backup
    
    # Stop existing services
    stop_services
    
    # Build images
    build_images
    
    # Start services
    start_services
    
    # Health check
    if health_check; then
        show_deployment_info
    else
        rollback
    fi
}

# Handle script arguments
case "${1:-production}" in
    production)
        ENVIRONMENT="production"
        ;;
    staging)
        ENVIRONMENT="staging"
        ;;
    *)
        print_error "Invalid environment. Use 'production' or 'staging'"
        exit 1
        ;;
esac

# Load environment variables
if [ -f ".env.$ENVIRONMENT" ]; then
    export $(cat .env.$ENVIRONMENT | grep -v '^#' | xargs)
fi

# Run main deployment
main "$@" 