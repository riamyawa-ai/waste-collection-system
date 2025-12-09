-- ============================================================================
-- FIX: SYNC EXISTING AUTH USERS TO PROFILES TABLE
-- Run this after dropping and recreating tables if you have existing users
-- ============================================================================

-- Insert profile for any existing auth users that don't have a profile yet
INSERT INTO public.profiles (id, first_name, last_name, email, phone, barangay, address, role, status, email_verified)
SELECT 
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'first_name',
    SPLIT_PART(au.raw_user_meta_data->>'full_name', ' ', 1), 
    'User'
  ),
  COALESCE(
    au.raw_user_meta_data->>'last_name',
    CASE 
      WHEN POSITION(' ' IN COALESCE(au.raw_user_meta_data->>'full_name', '')) > 0 
      THEN SUBSTRING(au.raw_user_meta_data->>'full_name' FROM POSITION(' ' IN au.raw_user_meta_data->>'full_name') + 1)
      ELSE ''
    END, 
    ''
  ),
  au.email,
  au.raw_user_meta_data->>'phone',
  au.raw_user_meta_data->>'barangay',
  au.raw_user_meta_data->>'address',
  COALESCE((au.raw_user_meta_data->>'role')::user_role, 'client'),
  'active'::user_status,
  COALESCE(au.email_confirmed_at IS NOT NULL, FALSE)
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- Show synced users
SELECT p.id, p.full_name, p.email, p.role, p.status 
FROM public.profiles p
ORDER BY p.created_at DESC
LIMIT 10;
