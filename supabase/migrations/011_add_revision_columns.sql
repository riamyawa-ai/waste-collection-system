-- Migration: Add missing columns for revision features
-- Adds columns needed for schedule accept/decline and maintenance announcements

-- ============================================================================
-- 1. ADD MISSING COLUMNS TO collection_schedules
-- ============================================================================

-- Add accepted_at column (for when collector accepts a schedule)
ALTER TABLE collection_schedules 
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;

-- Add declined_by column (to track who declined)
ALTER TABLE collection_schedules 
ADD COLUMN IF NOT EXISTS declined_by UUID REFERENCES profiles(id);

-- Add declined_at column (when schedule was declined)
ALTER TABLE collection_schedules 
ADD COLUMN IF NOT EXISTS declined_at TIMESTAMPTZ;

-- Add needs_reassignment status to schedule_status enum if not exists
DO $$ 
BEGIN
    -- Check if 'needs_reassignment' already exists in schedule_status
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'needs_reassignment' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'schedule_status')
    ) THEN
        ALTER TYPE schedule_status ADD VALUE 'needs_reassignment';
    END IF;
    
    -- Check if 'accepted' already exists in schedule_status
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'accepted' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'schedule_status')
    ) THEN
        ALTER TYPE schedule_status ADD VALUE 'accepted';
    END IF;
END $$;

-- ============================================================================
-- 2. ADD MISSING COLUMNS TO announcements (for maintenance window)
-- ============================================================================

-- Add maintenance_start column (when maintenance begins)
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS maintenance_start TIMESTAMPTZ;

-- Add maintenance_end column (when maintenance ends)
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS maintenance_end TIMESTAMPTZ;

-- Add index for maintenance window queries
CREATE INDEX IF NOT EXISTS idx_announcements_maintenance 
ON announcements(type, maintenance_start, maintenance_end) 
WHERE type = 'maintenance';

-- ============================================================================
-- 3. ADD MISSING COLUMNS TO collector_attendance (for auto clock-out)
-- ============================================================================

-- Add notes column if it doesn't exist
ALTER TABLE collector_attendance 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- ============================================================================
-- 4. GRANT PERMISSIONS
-- ============================================================================

-- Ensure service role can access new columns
GRANT SELECT, INSERT, UPDATE ON collection_schedules TO authenticated;
GRANT SELECT, INSERT, UPDATE ON announcements TO authenticated;
GRANT SELECT, INSERT, UPDATE ON collector_attendance TO authenticated;
