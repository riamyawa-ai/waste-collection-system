-- ============================================================================
-- FIX: Request Status History INSERT Policy
-- Date: 2025-12-09
-- 
-- Problem: When a user cancels/updates a request, the trigger 
-- track_request_status_change() tries to INSERT into request_status_history,
-- but there's no INSERT policy allowing this.
--
-- Solution: Make the trigger function SECURITY DEFINER so it bypasses RLS
-- ============================================================================

-- Drop and recreate the trigger function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION track_request_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO request_status_history (
      request_id,
      previous_status,
      new_status,
      changed_by,
      notes,
      metadata
    )
    VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      COALESCE(NEW.cancelled_by, NEW.rejected_by, NEW.assigned_by, auth.uid()),
      CASE 
        WHEN NEW.status = 'rejected' THEN NEW.rejection_reason
        WHEN NEW.status = 'cancelled' THEN NEW.cancellation_reason
        WHEN NEW.status = 'declined_by_collector' THEN NEW.collector_decline_reason
        ELSE NULL
      END,
      jsonb_build_object(
        'collector_id', NEW.assigned_collector_id,
        'scheduled_date', NEW.scheduled_date,
        'scheduled_time', NEW.scheduled_time
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The trigger already exists, but let's make sure it's connected to the updated function
DROP TRIGGER IF EXISTS track_request_status ON collection_requests;
CREATE TRIGGER track_request_status
  AFTER UPDATE ON collection_requests
  FOR EACH ROW EXECUTE FUNCTION track_request_status_change();

-- ============================================================================
-- Also ensure collection_requests UPDATE policies are correct
-- ============================================================================

-- Drop all existing client update policies
DROP POLICY IF EXISTS "Clients can update pending requests" ON collection_requests;
DROP POLICY IF EXISTS "Clients can update own cancellable requests" ON collection_requests;
DROP POLICY IF EXISTS "Clients can update own requests" ON collection_requests;

-- Create the correct policy for clients
CREATE POLICY "Clients can update own requests"
  ON collection_requests FOR UPDATE
  USING (
    client_id = auth.uid() 
    AND status IN ('pending', 'accepted')
  )
  WITH CHECK (
    client_id = auth.uid()
  );

-- ============================================================================
-- DONE!
-- ============================================================================
