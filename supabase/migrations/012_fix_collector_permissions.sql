-- Migration: Fix collector permissions for schedule updates
-- Allows collectors to update their assigned schedules (for accept/decline)

-- ============================================================================
-- 1. DROP EXISTING RESTRICTIVE POLICY
-- ============================================================================

-- The generic "Staff can update schedules" might be conflicting or insufficient
DROP POLICY IF EXISTS "Collector can update own schedules" ON collection_schedules;

-- ============================================================================
-- 2. CREATE NEW POLICY FOR COLLECTORS
-- ============================================================================

-- Allow collectors to update schedules assigned to them
CREATE POLICY "Collector can update own schedules"
  ON collection_schedules FOR UPDATE
  USING (
    auth.uid() = assigned_collector_id
  );

-- ============================================================================
-- 3. ENSURE SELECT PERMISSION
-- ============================================================================

-- Allow collectors to view their assigned schedules (likely covered, but ensuring)
CREATE POLICY "Collector can view own schedules"
  ON collection_schedules FOR SELECT
  USING (
    auth.uid() = assigned_collector_id 
    OR 
    auth.uid() = backup_collector_id
  );

-- ============================================================================
-- 4. GRANT PERMISSIONS TO AUTHENTICATED USERS
-- ============================================================================

-- Ensure the role has update permission on the table
GRANT UPDATE ON collection_schedules TO authenticated;
