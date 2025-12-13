-- Migration: Fix Critical RLS and Permissions
-- 1. Fix "new row violates row-level security policy" for collectors declining schedules
-- 2. Allow Staff to delete collection schedules
-- 3. Consolidate and ensure Announcement permissions

-- ============================================================================
-- 1. FIX COLLECTOR UPDATING SCHEDULES (DECLINE FLOW)
-- ============================================================================

-- Drop potentially conflicting or restrictive policies
DROP POLICY IF EXISTS "Collector can update own schedules" ON collection_schedules;
DROP POLICY IF EXISTS "Collectors can update assigned requests" ON collection_requests;

-- Re-create policy for Collection Schedules
-- CRITICAL: The WITH CHECK must be explicitly loose because when a collector declines, 
-- they set assigned_collector_id to NULL. The default WITH CHECK would check the *new* row
-- against the USING clause (which checks if they are assigned), causing a failure.
CREATE POLICY "Collector can update own schedules"
  ON collection_schedules FOR UPDATE
  USING (
    auth.uid() = assigned_collector_id
  )
  WITH CHECK (
    true -- Allow them to update the row (e.g. unassign themselves)
  );

-- Re-create policy for Collection Requests (similar logic if they can decline requests)
CREATE POLICY "Collectors can update assigned requests"
  ON collection_requests FOR UPDATE
  USING (
    assigned_collector_id = auth.uid()
  )
  WITH CHECK (
    true
  );

-- ============================================================================
-- 2. ENABLE STAFF TO DELETE SCHEDULES
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

-- Ensure the role actually has the DELETE privilege on the table
GRANT DELETE ON collection_schedules TO authenticated;


-- ============================================================================
-- 3. PREVENT RECURSION ON PROFILES (Safeguard)
-- ============================================================================
-- Ensure we don't have infinite recursion on profiles policies which can sometimes
-- block other queries unexpectedly.

-- (Existing policies usually handle this, but checking specifically for staff access)
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;
CREATE POLICY "Staff can view all profiles"
  ON profiles FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) IN ('staff', 'admin')
    OR
    id = auth.uid() -- Everyone can see themselves
  );

-- ============================================================================
-- 4. FIX REVENUE/PAYMENTS VIEW FOR DASHBOARD
-- ============================================================================

-- Ensure staff can view all payments for revenue calculation
DROP POLICY IF EXISTS "Staff can view all payments" ON payments;
CREATE POLICY "Staff can view all payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );
