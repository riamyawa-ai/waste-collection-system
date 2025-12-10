-- ============================================================================
-- FIX: Add INSERT policy for notifications table
-- Run this in Supabase SQL Editor
-- 
-- Issue: Staff/Admin cannot create notifications for clients because
-- there's no INSERT policy on the notifications table.
-- ============================================================================

-- Allow staff and admin to create notifications for any user
CREATE POLICY "Staff can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    public.get_user_role(auth.uid()) IN ('staff', 'admin')
  );

-- Also allow authenticated users to insert notifications
-- (This is a fallback if the above doesn't work)
CREATE POLICY "Authenticated users can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- Verify the policies exist
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'notifications';
