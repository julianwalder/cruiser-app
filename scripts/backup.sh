#!/bin/bash

# Database backup script for Cruiser Aviation Platform
# This script creates compressed backups with retention policy

set -e

# Configuration
BACKUP_DIR="/backups"
DB_NAME="${POSTGRES_DB:-cruiser_aviation}"
DB_USER="${POSTGRES_USER:-cruiser_user}"
DB_HOST="postgres"
RETENTION_DAYS=30
COMPRESSION_LEVEL=9

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

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/cruiser_aviation_$TIMESTAMP.sql.gz"

print_status "Starting database backup..."

# Create compressed backup
if pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" | gzip -$COMPRESSION_LEVEL > "$BACKUP_FILE"; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    print_success "Backup created successfully: $BACKUP_FILE ($BACKUP_SIZE)"
else
    print_error "Backup failed!"
    exit 1
fi

# Clean up old backups
print_status "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "cruiser_aviation_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

# List remaining backups
REMAINING_BACKUPS=$(find "$BACKUP_DIR" -name "cruiser_aviation_*.sql.gz" | wc -l)
print_success "Backup cleanup completed. $REMAINING_BACKUPS backups remaining."

# Verify backup integrity
print_status "Verifying backup integrity..."
if gunzip -t "$BACKUP_FILE"; then
    print_success "Backup integrity verified"
else
    print_error "Backup integrity check failed!"
    exit 1
fi

print_success "Database backup completed successfully!" 