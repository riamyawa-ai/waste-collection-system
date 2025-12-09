-- ============================================================================
-- FIX: Allow clients to cancel their own pending or accepted requests
-- Date: 2025-12-09
-- 
-- Problem: The existing RLS policy only allows clients to update requests
-- when status = 'pending', but they also need to cancel 'accepted' requests.
-- Additionally, the policy needs a WITH CHECK clause to allow status changes.
-- ============================================================================

-- Drop existing policies (use IF EXISTS to avoid errors)
DROP POLICY IF EXISTS "Clients can update pending requests" ON collection_requests;
DROP POLICY IF EXISTS "Clients can update own cancellable requests" ON collection_requests;

-- Create a proper policy for client updates with WITH CHECK
-- USING: determines which rows can be selected for update (pre-update state)
-- WITH CHECK: validates the row after the update (post-update state)
CREATE POLICY "Clients can update own cancellable requests"
  ON collection_requests FOR UPDATE
  USING (
    client_id = auth.uid() 
    AND status IN ('pending', 'accepted')
  )
  WITH CHECK (
    client_id = auth.uid()
  );

-- Add a comment for documentation
COMMENT ON POLICY "Clients can update own cancellable requests" ON collection_requests IS 
  'Allows clients to update (including cancel) their own requests that are in pending or accepted status';
