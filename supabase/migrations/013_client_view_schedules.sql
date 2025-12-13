-- Migration: Allow clients to view accepted public schedules
-- This enables clients to see the collection schedule for the whole system

-- ============================================================================
-- 1. ADD SELECT POLICY FOR CLIENTS ON COLLECTION_SCHEDULES
-- ============================================================================

-- Drop existing policy if it conflicts or is too restrictive
DROP POLICY IF EXISTS "Clients can view active schedules" ON collection_schedules;

-- Allow authenticated users (clients) to view active schedules
-- We restrict this to "accepted", "active" or "completed"
-- We cast to text safely or just check valid values
CREATE POLICY "Clients can view active schedules"
  ON collection_schedules FOR SELECT
  USING (
    status::text IN ('active', 'accepted', 'completed')
  );

-- ============================================================================
-- 2. ENSURE CLIENTS CAN SEE COLLECTOR PROFILES (Minimal info)
-- ============================================================================
-- Clients need to see the collector name for the schedule.
-- Existing policy "Public profiles are viewable by everyone" should cover this.
