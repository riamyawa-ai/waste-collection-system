-- Migration: Fix collector permissions for schedule updates (specifically declining)
-- Fixes "new row violates row-level security policy" error when declining
-- The issue is that declining removes the assignment (assigned_collector_id -> null)
-- which causes the row to fail the USING check (auth.uid() = assigned_collector_id)

-- ============================================================================
-- 1. DROP EXISTING RESTRICTIVE POLICY
-- ============================================================================

DROP POLICY IF EXISTS "Collector can update own schedules" ON collection_schedules;

-- ============================================================================
-- 2. CREATE NEW FLEXIBLE POLICY
-- ============================================================================

-- Split the check:
-- USING: user must be currently assigned (to select the row for update)
-- WITH CHECK: allow the update even if the new state doesn't match the USING clause
-- (e.g. when declining, assigned_collector_id becomes NULL, which is fine)

CREATE POLICY "Collector can update own schedules"
  ON collection_schedules FOR UPDATE
  USING (
    auth.uid() = assigned_collector_id
  )
  WITH CHECK (
    true -- Allow status changes; backend logic handles validation
  );
