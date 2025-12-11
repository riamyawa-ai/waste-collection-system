-- ============================================================================
-- MIGRATION 014: AUTO-VERIFY USERS CREATED BY ADMIN/STAFF
-- ============================================================================
-- This migration creates a function and trigger to automatically verify
-- users in auth.users when their profile is created with email_verified = true
-- ============================================================================

-- Function to sync email_verified from profiles to auth.users
CREATE OR REPLACE FUNCTION sync_email_verified_to_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- If email_verified is being set to true in profiles, update auth.users
  IF NEW.email_verified = TRUE AND (OLD IS NULL OR OLD.email_verified = FALSE) THEN
    UPDATE auth.users 
    SET email_confirmed_at = NOW(), 
        updated_at = NOW()
    WHERE id = NEW.id 
      AND email_confirmed_at IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync on profile insert or update
DROP TRIGGER IF EXISTS sync_email_verified_trigger ON profiles;

CREATE TRIGGER sync_email_verified_trigger
  AFTER INSERT OR UPDATE OF email_verified ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_email_verified_to_auth();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION sync_email_verified_to_auth() TO authenticated;
GRANT EXECUTE ON FUNCTION sync_email_verified_to_auth() TO service_role;

-- ============================================================================
-- Fix existing users that have email_verified = true in profiles
-- but email_confirmed_at IS NULL in auth.users
-- ============================================================================
UPDATE auth.users au
SET email_confirmed_at = NOW(), updated_at = NOW()
WHERE email_confirmed_at IS NULL
  AND EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = au.id AND p.email_verified = TRUE
  );

-- Verify the fix
SELECT 
  p.email,
  p.full_name,
  p.role,
  p.email_verified AS profile_verified,
  au.email_confirmed_at IS NOT NULL AS auth_verified
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.role IN ('admin', 'staff', 'collector')
ORDER BY p.role, p.created_at DESC;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- After running this migration:
-- 1. When admin/staff creates a user with email_verified = true in profiles
-- 2. The trigger automatically sets email_confirmed_at in auth.users
-- 3. The user can immediately log in without email verification
-- ============================================================================
