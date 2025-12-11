-- ============================================================================
-- FIX: Properly Restrict Staff Update Policy on collection_requests
-- Date: 2025-12-11
-- 
-- Issue: Migration 006 created an overly permissive policy with USING (true)
-- This migration fixes it to properly check user role using the secure function.
-- ============================================================================

-- Drop the overly permissive policy from migration 006
DROP POLICY IF EXISTS "Staff can update any request" ON collection_requests;

-- Recreate with proper role checking using the SECURITY DEFINER function
-- This prevents infinite recursion while still enforcing role-based access
CREATE POLICY "Staff can update any request"
  ON collection_requests FOR UPDATE
  USING (
    public.get_user_role(auth.uid()) IN ('staff', 'admin')
  )
  WITH CHECK (
    public.get_user_role(auth.uid()) IN ('staff', 'admin')
  );

-- Add comment for documentation
COMMENT ON POLICY "Staff can update any request" ON collection_requests IS 
  'Allows staff and admin users to update any collection request. Uses get_user_role() function to bypass RLS recursion.';

-- ============================================================================
-- Also fix any other potentially permissive policies
-- ============================================================================

-- Verify schedule_stops has proper policies
DROP POLICY IF EXISTS "Staff can manage stops" ON schedule_stops;

CREATE POLICY "Staff can manage stops"
  ON schedule_stops FOR ALL
  USING (
    public.get_user_role(auth.uid()) IN ('staff', 'admin')
  )
  WITH CHECK (
    public.get_user_role(auth.uid()) IN ('staff', 'admin')
  );

-- ============================================================================
-- Verify the policies exist and are correct
-- Run this query to check:
-- SELECT policyname, cmd, qual FROM pg_policies 
-- WHERE tablename = 'collection_requests' AND policyname LIKE '%Staff%';
-- ============================================================================
