-- ============================================================================
-- FIX: INFINITE RECURSION IN RLS POLICIES
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STEP 1: Create a SECURITY DEFINER function to get user role
-- This bypasses RLS when checking roles, breaking the recursion
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role::TEXT INTO user_role
  FROM public.profiles
  WHERE id = user_id;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;

-- ----------------------------------------------------------------------------
-- STEP 2: Drop existing problematic policies that cause recursion
-- ----------------------------------------------------------------------------

-- Drop collection_requests policies that check profiles
DROP POLICY IF EXISTS "Staff can view all requests" ON collection_requests;
DROP POLICY IF EXISTS "Staff can update any request" ON collection_requests;

-- Drop profiles policies that might cause issues
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON profiles;

-- ----------------------------------------------------------------------------
-- STEP 3: Recreate policies using the SECURITY DEFINER function
-- ----------------------------------------------------------------------------

-- Staff/Admin can view all requests (using function to avoid recursion)
CREATE POLICY "Staff can view all requests"
  ON collection_requests FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('staff', 'admin')
  );

-- Staff/Admin can update any request
CREATE POLICY "Staff can update any request"
  ON collection_requests FOR UPDATE
  USING (
    public.get_user_role(auth.uid()) IN ('staff', 'admin')
  );

-- Staff and Admin can view all profiles
CREATE POLICY "Staff can view all profiles"
  ON profiles FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('staff', 'admin')
  );

-- Admin can update any profile
CREATE POLICY "Admin can update any profile"
  ON profiles FOR UPDATE
  USING (
    public.get_user_role(auth.uid()) = 'admin'
  );

-- Admin can insert new profiles
CREATE POLICY "Admin can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    public.get_user_role(auth.uid()) = 'admin'
  );

-- ----------------------------------------------------------------------------
-- STEP 4: Fix other tables with similar issues
-- ----------------------------------------------------------------------------

-- Payments policies
DROP POLICY IF EXISTS "Staff can view all payments" ON payments;
DROP POLICY IF EXISTS "Staff can create payments" ON payments;
DROP POLICY IF EXISTS "Staff can update payments" ON payments;

CREATE POLICY "Staff can view all payments"
  ON payments FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('staff', 'admin')
  );

CREATE POLICY "Staff can create payments"
  ON payments FOR INSERT
  WITH CHECK (
    public.get_user_role(auth.uid()) IN ('staff', 'admin')
  );

CREATE POLICY "Staff can update payments"
  ON payments FOR UPDATE
  USING (
    public.get_user_role(auth.uid()) IN ('staff', 'admin')
  );

-- Feedback policies
DROP POLICY IF EXISTS "Staff can view all feedback" ON feedback;
DROP POLICY IF EXISTS "Staff can update feedback" ON feedback;

CREATE POLICY "Staff can view all feedback"
  ON feedback FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('staff', 'admin')
  );

CREATE POLICY "Staff can update feedback"
  ON feedback FOR UPDATE
  USING (
    public.get_user_role(auth.uid()) IN ('staff', 'admin')
  );

-- Schedules policies
DROP POLICY IF EXISTS "Staff can view all schedules" ON collection_schedules;
DROP POLICY IF EXISTS "Staff can create schedules" ON collection_schedules;
DROP POLICY IF EXISTS "Staff can update schedules" ON collection_schedules;

CREATE POLICY "Staff can view all schedules"
  ON collection_schedules FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('staff', 'admin')
  );

CREATE POLICY "Staff can create schedules"
  ON collection_schedules FOR INSERT
  WITH CHECK (
    public.get_user_role(auth.uid()) IN ('staff', 'admin')
  );

CREATE POLICY "Staff can update schedules"
  ON collection_schedules FOR UPDATE
  USING (
    public.get_user_role(auth.uid()) IN ('staff', 'admin')
  );

-- Photos policies
DROP POLICY IF EXISTS "Staff can view all photos" ON request_photos;

CREATE POLICY "Staff can view all photos"
  ON request_photos FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('staff', 'admin')
  );

-- Status history policies
DROP POLICY IF EXISTS "Staff can view all request history" ON request_status_history;

CREATE POLICY "Staff can view all request history"
  ON request_status_history FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('staff', 'admin')
  );

-- Announcements policies
DROP POLICY IF EXISTS "Staff can view all announcements" ON announcements;
DROP POLICY IF EXISTS "Staff can create announcements" ON announcements;
DROP POLICY IF EXISTS "Staff can update announcements" ON announcements;
DROP POLICY IF EXISTS "Staff can delete announcements" ON announcements;

CREATE POLICY "Staff can view all announcements"
  ON announcements FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('staff', 'admin')
  );

CREATE POLICY "Staff can create announcements"
  ON announcements FOR INSERT
  WITH CHECK (
    public.get_user_role(auth.uid()) IN ('staff', 'admin')
  );

CREATE POLICY "Staff can update announcements"
  ON announcements FOR UPDATE
  USING (
    public.get_user_role(auth.uid()) IN ('staff', 'admin')
  );

CREATE POLICY "Staff can delete announcements"
  ON announcements FOR DELETE
  USING (
    public.get_user_role(auth.uid()) IN ('staff', 'admin')
  );

-- Attendance policies
DROP POLICY IF EXISTS "Staff can view all attendance" ON collector_attendance;

CREATE POLICY "Staff can view all attendance"
  ON collector_attendance FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('staff', 'admin')
  );

-- Activity logs policies
DROP POLICY IF EXISTS "Admin can view activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Staff can view non-sensitive logs" ON activity_logs;

CREATE POLICY "Admin can view activity logs"
  ON activity_logs FOR SELECT
  USING (
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Staff can view non-sensitive logs"
  ON activity_logs FOR SELECT
  USING (
    public.get_user_role(auth.uid()) = 'staff'
  );

-- ============================================================================
-- DONE! The infinite recursion should now be fixed.
-- ============================================================================
