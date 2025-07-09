-- Add image_url field to base_designations table
-- Run with: npx wrangler d1 execute cruiser-db-staging --file=./src/migrations/005_add_base_image.sql

ALTER TABLE base_designations ADD COLUMN image_url TEXT; 