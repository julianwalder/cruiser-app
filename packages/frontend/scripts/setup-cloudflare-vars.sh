#!/bin/bash

# Cloudflare Environment Variables Setup Script
# This script sets up all environment variables in Cloudflare for both production and staging

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PRODUCTION_WORKER="cruiser-aviation-frontend"
STAGING_WORKER="cruiser-aviation-frontend-staging"

# Default environment variables (will be overridden by .env files if they exist)
# Using simple arrays instead of associative arrays for better compatibility
PROD_VARS_KEYS=(
    "VITE_API_URL"
    "VITE_APP_NAME"
    "VITE_APP_VERSION"
    "VITE_FIREBASE_API_KEY"
    "VITE_FIREBASE_AUTH_DOMAIN"
    "VITE_FIREBASE_PROJECT_ID"
    "VITE_FIREBASE_STORAGE_BUCKET"
    "VITE_FIREBASE_MESSAGING_SENDER_ID"
    "VITE_FIREBASE_APP_ID"
    "VITE_FIREBASE_MEASUREMENT_ID"
)

PROD_VARS_VALUES=(
    "https://api.cruiseraviation.com"
    "Cruiser Aviation"
    "1.0.0"
    ""
    "cruiserapp-b8429.firebaseapp.com"
    "cruiserapp-b8429"
    "cruiserapp-b8429.firebasestorage.app"
    "443919130210"
    "1:443919130210:web:b8a009ef9ca1ca4f433b3b"
    "G-BCDHQJ67Z0"
)

STAGING_VARS_KEYS=(
    "VITE_API_URL"
    "VITE_APP_NAME"
    "VITE_APP_VERSION"
    "VITE_FIREBASE_API_KEY"
    "VITE_FIREBASE_AUTH_DOMAIN"
    "VITE_FIREBASE_PROJECT_ID"
    "VITE_FIREBASE_STORAGE_BUCKET"
    "VITE_FIREBASE_MESSAGING_SENDER_ID"
    "VITE_FIREBASE_APP_ID"
    "VITE_FIREBASE_MEASUREMENT_ID"
)

STAGING_VARS_VALUES=(
    "https://staging-api.cruiseraviation.com"
    "Cruiser Aviation (Staging)"
    "1.0.0"
    ""
    "cruiserapp-b8429.firebaseapp.com"
    "cruiserapp-b8429"
    "cruiserapp-b8429.firebasestorage.app"
    "443919130210"
    "1:443919130210:web:b8a009ef9ca1ca4f433b3b"
    "G-BCDHQJ67Z0"
)

# Function to get variable value by key
get_var_value() {
    local key=$1
    local keys_array_name=$2
    local values_array_name=$3
    
    # Get the array names as strings
    local keys_array="${keys_array_name}[@]"
    local values_array="${values_array_name}[@]"
    
    # Convert to arrays
    local keys=("${!keys_array}")
    local values=("${!values_array}")
    
    # Find the index of the key
    for i in "${!keys[@]}"; do
        if [[ "${keys[$i]}" == "$key" ]]; then
            echo "${values[$i]}"
            return 0
        fi
    done
    echo ""
}

# Function to set variable value by key
set_var_value() {
    local key=$1
    local value=$2
    local keys_array_name=$3
    local values_array_name=$4
    
    # Get the array names as strings
    local keys_array="${keys_array_name}[@]"
    local values_array="${values_array_name}[@]"
    
    # Convert to arrays
    local keys=("${!keys_array}")
    local values=("${!values_array}")
    
    # Find the index of the key and update it
    for i in "${!keys[@]}"; do
        if [[ "${keys[$i]}" == "$key" ]]; then
            eval "${values_array_name}[$i]=\"$value\""
            return 0
        fi
    done
    
    # If key not found, add it
    eval "${keys_array_name}+=(\"$key\")"
    eval "${values_array_name}+=(\"$value\")"
}

# Function to load variables from .env file
load_env_file() {
    local env_file=$1
    local keys_array_name=$2
    local values_array_name=$3
    
    if [[ -f "$env_file" ]]; then
        echo -e "${BLUE}Loading variables from ${env_file}...${NC}"
        while IFS='=' read -r key value; do
            # Skip comments and empty lines
            if [[ ! "$key" =~ ^#.*$ ]] && [[ -n "$key" ]]; then
                # Remove quotes from value
                value=$(echo "$value" | sed 's/^["'\'']//;s/["'\'']$//')
                set_var_value "$key" "$value" "$keys_array_name" "$values_array_name"
                echo -e "  ${GREEN}Loaded: ${key}=${value}${NC}"
            fi
        done < "$env_file"
    else
        echo -e "${YELLOW}⚠️  ${env_file} not found, using defaults${NC}"
    fi
}

# Function to prompt for missing variables
prompt_for_missing_vars() {
    local env_name=$1
    local keys_array_name=$2
    local values_array_name=$3
    
    echo -e "\n${BLUE}Checking for missing variables in ${env_name}...${NC}"
    
    # List of required variables
    local required_vars=(
        "VITE_API_URL"
        "VITE_APP_NAME"
        "VITE_FIREBASE_API_KEY"
        "VITE_FIREBASE_AUTH_DOMAIN"
        "VITE_FIREBASE_PROJECT_ID"
    )
    
    for var in "${required_vars[@]}"; do
        local current_value=$(get_var_value "$var" "$keys_array_name" "$values_array_name")
        if [[ -z "$current_value" ]]; then
            echo -e "${YELLOW}⚠️  ${var} is missing for ${env_name}${NC}"
            read -p "Enter value for ${var}: " value
            if [[ -n "$value" ]]; then
                set_var_value "$var" "$value" "$keys_array_name" "$values_array_name"
                echo -e "${GREEN}✅ ${var} set to: ${value}${NC}"
            fi
        fi
    done
}

echo -e "${BLUE}🚀 Cloudflare Environment Variables Setup${NC}"
echo "=================================="

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler CLI is not installed. Please install it first:${NC}"
    echo "npm install -g wrangler"
    exit 1
fi

# Check if user is logged in to Cloudflare
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  You need to log in to Cloudflare first.${NC}"
    echo "Run: wrangler login"
    exit 1
fi

echo -e "${GREEN}✅ Wrangler CLI is installed and you're logged in${NC}"

# Load environment variables from .env files
load_env_file ".env.production" "PROD_VARS_KEYS" "PROD_VARS_VALUES"
load_env_file ".env.staging" "STAGING_VARS_KEYS" "STAGING_VARS_VALUES"

# Prompt for any missing required variables
prompt_for_missing_vars "production" "PROD_VARS_KEYS" "PROD_VARS_VALUES"
prompt_for_missing_vars "staging" "STAGING_VARS_KEYS" "STAGING_VARS_VALUES"

# Function to set variables for an environment
set_variables_for_env() {
    local worker_name=$1
    local env_name=$2
    local keys_array_name=$3
    local values_array_name=$4
    
    echo -e "\n${BLUE}Setting up ${env_name} environment variables for ${worker_name}...${NC}"
    
    # Get the array names as strings
    local keys_array="${keys_array_name}[@]"
    local values_array="${values_array_name}[@]"
    
    # Convert to arrays
    local keys=("${!keys_array}")
    local values=("${!values_array}")
    
    for i in "${!keys[@]}"; do
        local key="${keys[$i]}"
        local value="${values[$i]}"
        echo -e "  ${YELLOW}Setting ${key}...${NC}"
        
        if wrangler secret put "$key" --env "$env_name" <<< "$value" 2>/dev/null; then
            echo -e "    ${GREEN}✅ ${key} set successfully${NC}"
        else
            echo -e "    ${RED}❌ Failed to set ${key}${NC}"
        fi
    done
}

# Function to list current variables
list_variables() {
    local worker_name=$1
    local env_name=$2
    
    echo -e "\n${BLUE}Current variables for ${env_name} (${worker_name}):${NC}"
    if wrangler secret list --env "$env_name" 2>/dev/null; then
        echo -e "${GREEN}✅ Variables listed successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  No variables found or error listing variables${NC}"
    fi
}

# Function to delete all variables (with confirmation)
delete_all_variables() {
    local worker_name=$1
    local env_name=$2
    
    echo -e "\n${RED}⚠️  WARNING: This will delete ALL variables for ${env_name}${NC}"
    read -p "Are you sure you want to continue? (y/N): " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Deleting all variables for ${env_name}...${NC}"
        wrangler secret list --env "$env_name" | grep -E "^[A-Z_]+$" | while read -r secret; do
            echo "Deleting $secret..."
            wrangler secret delete "$secret" --env "$env_name" 2>/dev/null || true
        done
        echo -e "${GREEN}✅ All variables deleted for ${env_name}${NC}"
    else
        echo -e "${BLUE}Operation cancelled${NC}"
    fi
}

# Parse command line arguments
ACTION="setup"
while [[ $# -gt 0 ]]; do
    case $1 in
        --list)
            ACTION="list"
            shift
            ;;
        --delete)
            ACTION="delete"
            shift
            ;;
        --env)
            ENV="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --setup     Set up environment variables (default)"
            echo "  --list      List current environment variables"
            echo "  --delete    Delete all environment variables"
            echo "  --env ENV   Specify environment (production or staging)"
            echo "  --help      Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    # Set up all environments"
            echo "  $0 --list             # List all variables"
            echo "  $0 --list --env prod  # List production variables"
            echo "  $0 --delete --env staging  # Delete staging variables"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Main execution based on action
case $ACTION in
    "setup")
        echo -e "\n${BLUE}Setting up Production Environment...${NC}"
        set_variables_for_env "$PRODUCTION_WORKER" "production" "PROD_VARS_KEYS" "PROD_VARS_VALUES"
        
        echo -e "\n${BLUE}Setting up Staging Environment...${NC}"
        set_variables_for_env "$STAGING_WORKER" "staging" "STAGING_VARS_KEYS" "STAGING_VARS_VALUES"
        
        # List current variables
        echo -e "\n${BLUE}Listing current variables...${NC}"
        list_variables "$PRODUCTION_WORKER" "production"
        list_variables "$STAGING_WORKER" "staging"
        
        echo -e "\n${GREEN}🎉 Environment variables setup complete!${NC}"
        ;;
    "list")
        if [[ -n "$ENV" ]]; then
            if [[ "$ENV" == "production" || "$ENV" == "prod" ]]; then
                list_variables "$PRODUCTION_WORKER" "production"
            elif [[ "$ENV" == "staging" || "$ENV" == "stage" ]]; then
                list_variables "$STAGING_WORKER" "staging"
            else
                echo -e "${RED}❌ Invalid environment: $ENV${NC}"
                exit 1
            fi
        else
            list_variables "$PRODUCTION_WORKER" "production"
            list_variables "$STAGING_WORKER" "staging"
        fi
        ;;
    "delete")
        if [[ -n "$ENV" ]]; then
            if [[ "$ENV" == "production" || "$ENV" == "prod" ]]; then
                delete_all_variables "$PRODUCTION_WORKER" "production"
            elif [[ "$ENV" == "staging" || "$ENV" == "stage" ]]; then
                delete_all_variables "$STAGING_WORKER" "staging"
            else
                echo -e "${RED}❌ Invalid environment: $ENV${NC}"
                exit 1
            fi
        else
            delete_all_variables "$PRODUCTION_WORKER" "production"
            delete_all_variables "$STAGING_WORKER" "staging"
        fi
        ;;
esac

echo -e "\n${BLUE}Next steps:${NC}"
echo "1. Deploy your application: npm run deploy:prod or npm run deploy:staging"
echo "2. Test your application to ensure variables are working"
echo "3. You can view/edit variables in the Cloudflare Dashboard"
echo "   - Production: https://dash.cloudflare.com/workers/overview/$PRODUCTION_WORKER"
echo "   - Staging: https://dash.cloudflare.com/workers/overview/$STAGING_WORKER" 