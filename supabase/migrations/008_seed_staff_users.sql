-- ============================================================================
-- SEED DATA: Create Staff and Admin Users
-- Run this in Supabase SQL Editor to create staff accounts
-- ============================================================================

-- Note: To create staff users, you need to:
-- 1. First create the user through Supabase Auth (via the API or Dashboard)
-- 2. Then update their profile to set the correct role

-- Option 1: Create users directly in profiles table 
-- (Use this after manually creating the auth.users entry)

-- You can create users through the Supabase Auth API like this in your application:
-- const { data, error } = await supabase.auth.admin.createUser({
--   email: 'staff@example.com',
--   password: 'SecurePassword123!',
--   email_confirm: true,
--   user_metadata: {
--     first_name: 'Staff',
--     last_name: 'User',
--     role: 'staff'
--   }
-- })

-- Option 2: Update an existing user to staff role
-- If you already have a user registered, run this to make them staff:

-- UPDATE profiles 
-- SET role = 'staff', status = 'active'
-- WHERE email = 'your-email@example.com';

-- Option 3: Create sample staff profile (requires matching auth.users entry)
-- This won't work without first creating the auth user

-- Sample SQL to view all users and their roles:
-- SELECT id, email, full_name, role, status, created_at FROM profiles ORDER BY created_at DESC;

-- Sample SQL to change a user to staff:
-- UPDATE profiles SET role = 'staff' WHERE email = 'user@example.com';

-- Sample SQL to change a user to admin:
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';

-- Sample SQL to change a user to collector:
-- UPDATE profiles SET role = 'collector' WHERE email = 'collector@example.com';

-- ============================================================================
-- IMPORTANT: The proper way to create staff/admin users is:
-- 
-- 1. Register through the normal signup form with role metadata
-- 2. Or use Supabase Dashboard > Authentication > Users > Add User
--    Then update the profile role via SQL
-- ============================================================================

-- View current users for reference
SELECT 
    id,
    email,
    full_name,
    role,
    status,
    created_at
FROM profiles 
ORDER BY created_at DESC
LIMIT 20;
