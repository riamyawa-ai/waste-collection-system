-- ============================================================================
-- MIGRATION 011: FIX USER PROFILE CREATION TRIGGER
-- ============================================================================
-- This migration fixes the issue where users are created in auth.users
-- but profiles are not being created in public.profiles
-- ============================================================================

-- Step 1: Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Create an improved handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_first_name TEXT;
  v_last_name TEXT;
  v_role user_role;
BEGIN
  -- Extract first_name with multiple fallbacks
  v_first_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'first_name'), ''),
    NULLIF(TRIM(SPLIT_PART(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 1)), ''),
    NULLIF(TRIM(SPLIT_PART(COALESCE(NEW.email, ''), '@', 1)), ''),
    'User'
  );
  
  -- Extract last_name with multiple fallbacks
  v_last_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'last_name'), ''),
    CASE 
      WHEN POSITION(' ' IN COALESCE(NEW.raw_user_meta_data->>'full_name', '')) > 0 
      THEN TRIM(SUBSTRING(NEW.raw_user_meta_data->>'full_name' FROM POSITION(' ' IN NEW.raw_user_meta_data->>'full_name') + 1))
      ELSE ''
    END
  );
  
  -- If last_name is still empty, set to empty string (not NULL)
  IF v_last_name IS NULL OR v_last_name = '' THEN
    v_last_name := '';
  END IF;
  
  -- Extract role with validation
  BEGIN
    v_role := COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'client'::user_role
    );
  EXCEPTION
    WHEN invalid_text_representation THEN
      v_role := 'client'::user_role;
  END;
  
  -- Insert into profiles table
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    email, 
    phone, 
    barangay, 
    address, 
    role,
    status,
    email_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    v_first_name,
    v_last_name,
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'barangay',
    NEW.raw_user_meta_data->>'address',
    v_role,
    'active'::user_status,
    COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    barangay = COALESCE(EXCLUDED.barangay, profiles.barangay),
    address = COALESCE(EXCLUDED.address, profiles.address),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error for debugging
    RAISE LOG 'handle_new_user failed for user %: % (SQLSTATE: %)', 
      NEW.id, SQLERRM, SQLSTATE;
    -- Still return NEW to not block the auth signup
    RETURN NEW;
END;
$$;

-- Step 3: Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Step 5: Sync any existing auth.users that don't have profiles
INSERT INTO public.profiles (id, first_name, last_name, email, phone, barangay, address, role, status, email_verified, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(
    NULLIF(TRIM(au.raw_user_meta_data->>'first_name'), ''),
    NULLIF(TRIM(SPLIT_PART(COALESCE(au.raw_user_meta_data->>'full_name', ''), ' ', 1)), ''),
    NULLIF(TRIM(SPLIT_PART(COALESCE(au.email, ''), '@', 1)), ''),
    'User'
  ) AS first_name,
  COALESCE(
    NULLIF(TRIM(au.raw_user_meta_data->>'last_name'), ''),
    CASE 
      WHEN POSITION(' ' IN COALESCE(au.raw_user_meta_data->>'full_name', '')) > 0 
      THEN TRIM(SUBSTRING(au.raw_user_meta_data->>'full_name' FROM POSITION(' ' IN au.raw_user_meta_data->>'full_name') + 1))
      ELSE ''
    END
  ) AS last_name,
  COALESCE(au.email, '') AS email,
  au.raw_user_meta_data->>'phone' AS phone,
  au.raw_user_meta_data->>'barangay' AS barangay,
  au.raw_user_meta_data->>'address' AS address,
  COALESCE((au.raw_user_meta_data->>'role')::user_role, 'client'::user_role) AS role,
  'active'::user_status AS status,
  COALESCE(au.email_confirmed_at IS NOT NULL, FALSE) AS email_verified,
  COALESCE(au.created_at, NOW()) AS created_at,
  NOW() AS updated_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- Step 6: Verify the fix
DO $$
DECLARE
  auth_count INTEGER;
  profile_count INTEGER;
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO auth_count FROM auth.users;
  SELECT COUNT(*) INTO profile_count FROM public.profiles;
  SELECT COUNT(*) INTO missing_count 
  FROM auth.users au 
  WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id);
  
  RAISE NOTICE '=== Profile Sync Status ===';
  RAISE NOTICE 'Total auth.users: %', auth_count;
  RAISE NOTICE 'Total profiles: %', profile_count;
  RAISE NOTICE 'Missing profiles: %', missing_count;
  
  IF missing_count > 0 THEN
    RAISE WARNING 'There are still % users without profiles!', missing_count;
  ELSE
    RAISE NOTICE 'All users have profiles. Sync complete!';
  END IF;
END $$;
