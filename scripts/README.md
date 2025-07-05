# Environment Population Scripts

This directory contains scripts to populate your Cloudflare environments (staging and production) with mock data from your local development environment.

## Populate Environments Script

The `populate-environments.js` script populates both R2 storage and D1 databases for staging and production environments with mock data.

### Usage

```bash
# Populate staging environment only
npm run populate:staging

# Populate production environment only
npm run populate:production

# Populate both staging and production environments
npm run populate:all

# Or run the script directly
node scripts/populate-environments.js [staging|production]
```

### What it does

1. **D1 Database Population**:
   - Clears existing data from all tables
   - Inserts mock users, bases, services, and aircraft data
   - Resets auto-increment counters

2. **R2 Storage Population**:
   - Downloads sample images from Picsum Photos
   - Uploads them to your R2 storage bucket
   - Creates placeholder images for services, bases, aircraft, and users

3. **Verification**:
   - Counts records in each table
   - Lists objects in R2 storage
   - Provides summary of populated data

### Mock Data Included

- **Users**: 3 users (admin, pilot, student pilot) with full profile data
- **Bases**: 2 bases (Main Airport, Regional Field) with location details
- **Services**: 3 services (Flight Training, Aircraft Rental, Maintenance)
- **Aircraft**: 2 aircraft (Cessna 172, Piper Arrow) with maintenance data
- **Images**: Sample images for all entities

### Prerequisites

- Wrangler CLI installed and authenticated
- D1 databases created (`cruiser-db-staging`, `cruiser-db-production`)
- R2 buckets created (`cruiser-storage-staging`, `cruiser-storage-production`)
- Proper permissions to access Cloudflare resources

### Notes

- The script uses the same mock data as your local development environment
- Images are downloaded from Picsum Photos for demonstration purposes
- All data is cleared before new data is inserted
- The script provides detailed logging of all operations

### Troubleshooting

If you encounter errors:

1. **D1 Database Errors**: Ensure your D1 databases exist and have the correct schema
2. **R2 Storage Errors**: Verify your R2 buckets exist and you have upload permissions
3. **Authentication Errors**: Run `npx wrangler login` to authenticate with Cloudflare
4. **Permission Errors**: Check that your API token has the necessary permissions

### Customization

To modify the mock data, edit the `mockData` object in `populate-environments.js`. The script will automatically generate the appropriate SQL statements and upload the corresponding images. 