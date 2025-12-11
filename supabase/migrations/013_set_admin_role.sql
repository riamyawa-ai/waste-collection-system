-- ============================================================================
-- QUICK FIX: Set User Role to Admin
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Find your user and see their current role
SELECT id, email, full_name, role, status 
FROM profiles 
WHERE email = 'riamyawa@gmail.com';

-- Step 2: Update the role to admin
UPDATE profiles 
SET role = 'admin', status = 'active', email_verified = TRUE
WHERE email = 'riamyawa@gmail.com';

-- Step 3: Verify the update
SELECT id, email, full_name, role, status, email_verified
FROM profiles 
WHERE email = 'riamyawa@gmail.com';

-- ============================================================================
-- If the user doesn't exist in profiles, run this to sync from auth.users
-- ============================================================================
INSERT INTO profiles (id, first_name, last_name, email, role, status, email_verified, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(
    NULLIF(TRIM(au.raw_user_meta_data->>'first_name'), ''),
    NULLIF(TRIM(SPLIT_PART(COALESCE(au.raw_user_meta_data->>'full_name', ''), ' ', 1)), ''),
    'Admin'
  ),
  COALESCE(
    NULLIF(TRIM(au.raw_user_meta_data->>'last_name'), ''),
    'User'
  ),
  au.email,
  'admin'::user_role,
  'active'::user_status,
  TRUE,
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'riamyawa@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  status = 'active',
  email_verified = TRUE,
  updated_at = NOW();

-- Final verification
SELECT id, email, full_name, role, status FROM profiles WHERE email = 'riamyawa@gmail.com';
