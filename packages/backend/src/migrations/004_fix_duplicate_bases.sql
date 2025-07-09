-- Fix Duplicate Base Designations Migration for Cruiser Aviation
-- Run with: npx wrangler d1 execute cruiser-db-staging --file=./src/migrations/004_fix_duplicate_bases.sql

-- First, let's see what duplicate base designations exist
-- This will show us airfields with multiple active base designations
SELECT 
  airfield_id,
  COUNT(*) as base_count,
  GROUP_CONCAT(id) as base_ids
FROM base_designations 
WHERE is_active = 1 
GROUP BY airfield_id 
HAVING COUNT(*) > 1;

-- For each airfield with multiple base designations, keep only the most recent one
-- and deactivate the others

-- Step 1: Create a temporary table to identify the base designations to keep
CREATE TEMPORARY TABLE base_designations_to_keep AS
SELECT 
  airfield_id,
  MAX(updated_at) as latest_updated_at
FROM base_designations 
WHERE is_active = 1 
GROUP BY airfield_id;

-- Step 2: Deactivate all base designations except the most recent one for each airfield
UPDATE base_designations 
SET is_active = 0, updated_at = datetime('now')
WHERE id NOT IN (
  SELECT bd.id 
  FROM base_designations bd
  INNER JOIN base_designations_to_keep bdtk 
    ON bd.airfield_id = bdtk.airfield_id 
    AND bd.updated_at = bdtk.latest_updated_at
  WHERE bd.is_active = 1
);

-- Step 3: Clean up the temporary table
DROP TABLE base_designations_to_keep;

-- Verify the fix - should show no duplicates
SELECT 
  airfield_id,
  COUNT(*) as base_count
FROM base_designations 
WHERE is_active = 1 
GROUP BY airfield_id 
HAVING COUNT(*) > 1; 