-- ============================================================================
-- FIX: Updated handle_new_user() trigger function
-- Run this in Supabase SQL Editor to fix the "Database error saving new user" issue
-- ============================================================================

-- Drop and recreate the function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (
    id, 
    first_name, 
    last_name, 
    email, 
    phone, 
    barangay, 
    address, 
    role,
    email_verified
  )
  VALUES (
    NEW.id,
    -- Get first_name from metadata, fallback to splitting full_name, fallback to 'User'
    COALESCE(
      NEW.raw_user_meta_data->>'first_name',
      SPLIT_PART(COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'), ' ', 1),
      'User'
    ),
    -- Get last_name from metadata, fallback to splitting full_name, fallback to empty
    COALESCE(
      NEW.raw_user_meta_data->>'last_name',
      CASE 
        WHEN POSITION(' ' IN COALESCE(NEW.raw_user_meta_data->>'full_name', '')) > 0 
        THEN SUBSTRING(NEW.raw_user_meta_data->>'full_name' FROM POSITION(' ' IN NEW.raw_user_meta_data->>'full_name') + 1)
        ELSE ''
      END,
      ''
    ),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'barangay',
    NEW.raw_user_meta_data->>'address',
    -- Role with proper casting and fallback
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'client'::user_role
    ),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE)
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth signup
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
