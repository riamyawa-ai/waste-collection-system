-- Migration: Add auto clock-out scheduled function
-- This function runs at midnight to automatically clock out collectors who forgot

-- Create the auto clock-out function
CREATE OR REPLACE FUNCTION public.auto_clock_out_collectors()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    record_row RECORD;
    current_time_now TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
    -- Find all active attendance records that haven't been clocked out
    FOR record_row IN
        SELECT id, collector_id, login_time, date
        FROM collector_attendance
        WHERE logout_time IS NULL
        AND date < CURRENT_DATE  -- Only process records from previous days
    LOOP
        -- Update the record with automatic logout
        UPDATE collector_attendance
        SET 
            logout_time = (date + INTERVAL '23:59:59'),  -- Set to end of the day
            notes = COALESCE(notes || E'\n', '') || 'Automatic logout – forgot to clock out',
            updated_at = current_time_now
        WHERE id = record_row.id;
        
        -- Optional: Create a notification for the collector
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            data,
            created_at
        ) VALUES (
            record_row.collector_id,
            'auto_clock_out',
            'Automatic Clock-Out',
            'You were automatically clocked out at midnight because you forgot to clock out. Your attendance record has been updated.',
            jsonb_build_object('attendance_id', record_row.id, 'date', record_row.date),
            current_time_now
        );
    END LOOP;
END;
$$;

-- Create the pg_cron extension if not exists (requires superuser in Supabase)
-- Note: This may need to be enabled via Supabase Dashboard > Database > Extensions
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the function to run at midnight (00:00) every day
-- Note: This requires pg_cron extension to be enabled
-- Run this in the Supabase SQL Editor after enabling pg_cron:
/*
SELECT cron.schedule(
    'auto-clock-out-collectors',  -- job name
    '0 0 * * *',                   -- cron expression: run at 00:00 every day
    $$SELECT public.auto_clock_out_collectors()$$
);
*/

-- Alternative: Create a Supabase Edge Function trigger
-- If pg_cron is not available, create a Supabase Edge Function
-- that calls this function and use Supabase Scheduled Functions (Cron)

-- Add index for faster lookup of unclosed attendance records
CREATE INDEX IF NOT EXISTS idx_collector_attendance_unclosed 
ON collector_attendance (date) 
WHERE logout_time IS NULL;

-- Add notes column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'collector_attendance' 
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE collector_attendance ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.auto_clock_out_collectors() TO service_role;
