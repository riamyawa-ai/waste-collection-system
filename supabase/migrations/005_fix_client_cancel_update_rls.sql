-- ============================================================================
-- FIX: Allow clients to cancel their own pending or accepted requests
-- Date: 2025-12-09
-- 
-- Problem: The existing RLS policy only allows clients to update requests
-- when status = 'pending', but they also need to cancel 'accepted' requests.
-- Additionally, the policy needs to allow the status to be changed to 'cancelled'.
-- ============================================================================

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Clients can update pending requests" ON collection_requests;

-- Create a more permissive policy for client updates
-- Clients can update their own requests if:
-- 1. They own the request (client_id = auth.uid())
-- 2. The current status is 'pending' or 'accepted' (cancellable states)
CREATE POLICY "Clients can update own cancellable requests"
  ON collection_requests FOR UPDATE
  USING (
    client_id = auth.uid() 
    AND status IN ('pending', 'accepted')
  );

-- Add a comment for documentation
COMMENT ON POLICY "Clients can update own cancellable requests" ON collection_requests IS 
  'Allows clients to update (including cancel) their own requests that are in pending or accepted status';
