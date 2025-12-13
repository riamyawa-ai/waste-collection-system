-- Migration: Fix announcement permissions and schedule status labels
-- Allows both Staff and Admin roles to create/manage announcements
-- Adds pending_collector status for schedules created by staff

-- ============================================================================
-- 0. ADD SCHEDULE_ASSIGNMENT TO NOTIFICATION TYPE ENUM
-- ============================================================================

DO $$ 
BEGIN
    -- Check if 'schedule_assignment' already exists in notification_type
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'schedule_assignment' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')
    ) THEN
        ALTER TYPE notification_type ADD VALUE 'schedule_assignment';
    END IF;
END $$;

-- ============================================================================
-- 1. UPDATE ANNOUNCEMENTS RLS POLICY
-- Allow staff to create and manage announcements (not just admin)
-- ============================================================================

-- Drop existing insert policy
DROP POLICY IF EXISTS "Staff and admin can create announcements" ON announcements;
DROP POLICY IF EXISTS "Admin can manage announcements" ON announcements;

-- Create new insert policy for staff and admin
CREATE POLICY "Staff and admin can create announcements"
  ON announcements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Create update policy for staff and admin
CREATE POLICY "Staff and admin can update announcements"
  ON announcements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Create delete policy for staff and admin
CREATE POLICY "Staff and admin can delete announcements"
  ON announcements FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Allow staff and admin to read all announcements
DROP POLICY IF EXISTS "Staff and admin can view all announcements" ON announcements;
CREATE POLICY "Staff and admin can view all announcements"
  ON announcements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- ============================================================================
-- 2. ADD PENDING STATUS FOR SCHEDULES (awaiting collector acceptance)
-- ============================================================================

-- Note: The schedule_status enum already includes 'draft', 'active', 'completed', 'cancelled'
-- 'draft' will be used as "Pending" status when a collector is assigned but hasn't accepted yet
-- We'll add a column to track if collector has confirmed

ALTER TABLE collection_schedules 
  ADD COLUMN IF NOT EXISTS collector_confirmed_at TIMESTAMPTZ;

-- ============================================================================
-- 3. ADD DELETE POLICY FOR STAFF (missing from original schema)
-- ============================================================================

DROP POLICY IF EXISTS "Staff can delete schedules" ON collection_schedules;
CREATE POLICY "Staff can delete schedules"
  ON collection_schedules FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Grant DELETE permission
GRANT DELETE ON collection_schedules TO authenticated;

-- ============================================================================
-- 3. ENSURE PUBLIC READ ACCESS FOR PUBLISHED ANNOUNCEMENTS
-- ============================================================================

DROP POLICY IF EXISTS "Public can view published announcements" ON announcements;
CREATE POLICY "Public can view published announcements"
  ON announcements FOR SELECT
  USING (
    is_published = true
    AND publish_date <= NOW()
    AND (expiry_date IS NULL OR expiry_date > NOW())
  );
