-- Migration: Add maintenance_allowed_roles to announcements
-- Allows configuring specific roles that can access the system during maintenance

-- ============================================================================
-- 1. ADD COLUMN TO ANNOUNCEMENTS
-- ============================================================================

ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS maintenance_allowed_roles TEXT[] DEFAULT ARRAY['admin'];

-- ============================================================================
-- 2. UPDATE EXISTING RECORDS
-- ============================================================================

-- Set default for any existing maintenance type announcements
UPDATE announcements 
SET maintenance_allowed_roles = ARRAY['admin']
WHERE type = 'maintenance' AND maintenance_allowed_roles IS NULL;

-- ============================================================================
-- 3. INDEX FOR PERFORMANCE
-- ============================================================================

-- No specific index needed for this array column as it will be fetched with the announcement
