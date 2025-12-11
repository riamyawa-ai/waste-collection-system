-- ============================================================================
-- Migration: Add staff_notes column to collection_requests table
-- Date: 2025-12-11
-- Description: Adds staff_notes column that was missing from collection_requests
-- ============================================================================

-- Add staff_notes column to collection_requests table
ALTER TABLE collection_requests
ADD COLUMN IF NOT EXISTS staff_notes TEXT;

-- Add comment to document the column
COMMENT ON COLUMN collection_requests.staff_notes IS 'Notes added by staff during assignment or processing';
