-- ============================================================================
-- MIGRATION 012: CREATE ADMIN AND COLLECTOR ACCOUNTS
-- ============================================================================
-- This migration creates initial admin and collector accounts for testing
-- and system setup. 
--
-- ⚠️ IMPORTANT: Change the default passwords before deploying to production!
-- ============================================================================

-- ============================================================================
-- STEP 1: Enable required extensions
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- STEP 2: Create the admin user in auth.users
-- ============================================================================
-- Admin account credentials:
-- Email: admin@ecocollect.ph
-- Password: Admin@123456
-- ============================================================================

DO $$
DECLARE
  admin_user_id UUID;
  collector_user_id UUID;
  collector2_user_id UUID;
BEGIN
  -- =========================================================================
  -- CREATE ADMIN USER
  -- =========================================================================
  -- Check if admin already exists
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@ecocollect.ph';
  
  IF admin_user_id IS NULL THEN
    -- Generate new UUID for admin
    admin_user_id := gen_random_uuid();
    
    -- Insert into auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      admin_user_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@ecocollect.ph',
      crypt('Admin@123456', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      jsonb_build_object(
        'first_name', 'System',
        'last_name', 'Administrator',
        'full_name', 'System Administrator',
        'role', 'admin',
        'phone', '+639123456789',
        'barangay', 'Poblacion',
        'address', 'City Hall, Panabo City'
      ),
      'authenticated',
      'authenticated',
      NOW(),
      NOW(),
      '',
      ''
    );
    
    -- Insert into auth.identities
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      admin_user_id,
      jsonb_build_object('sub', admin_user_id::text, 'email', 'admin@ecocollect.ph'),
      'email',
      admin_user_id::text,
      NOW(),
      NOW(),
      NOW()
    );
    
    -- Insert profile (in case trigger doesn't fire)
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
    ) VALUES (
      admin_user_id,
      'System',
      'Administrator',
      'admin@ecocollect.ph',
      '+639123456789',
      'Poblacion',
      'City Hall, Panabo City',
      'admin',
      'active',
      TRUE,
      NOW(),
      NOW()
    ) ON CONFLICT (id) DO UPDATE SET
      role = 'admin',
      status = 'active',
      email_verified = TRUE,
      updated_at = NOW();
    
    RAISE NOTICE '✅ Admin user created: admin@ecocollect.ph';
  ELSE
    -- Update existing admin profile
    UPDATE public.profiles 
    SET role = 'admin', status = 'active', email_verified = TRUE, updated_at = NOW()
    WHERE id = admin_user_id;
    RAISE NOTICE '⚠️ Admin user already exists, updated role to admin';
  END IF;
  
  -- =========================================================================
  -- CREATE COLLECTOR USER 1
  -- =========================================================================
  -- Collector account credentials:
  -- Email: collector@ecocollect.ph
  -- Password: Collector@123456
  -- =========================================================================
  
  SELECT id INTO collector_user_id FROM auth.users WHERE email = 'collector@ecocollect.ph';
  
  IF collector_user_id IS NULL THEN
    collector_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      collector_user_id,
      '00000000-0000-0000-0000-000000000000',
      'collector@ecocollect.ph',
      crypt('Collector@123456', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      jsonb_build_object(
        'first_name', 'Juan',
        'last_name', 'Dela Cruz',
        'full_name', 'Juan Dela Cruz',
        'role', 'collector',
        'phone', '+639234567890',
        'barangay', 'San Pedro',
        'address', '123 Collector St, San Pedro, Panabo City'
      ),
      'authenticated',
      'authenticated',
      NOW(),
      NOW(),
      '',
      ''
    );
    
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      collector_user_id,
      jsonb_build_object('sub', collector_user_id::text, 'email', 'collector@ecocollect.ph'),
      'email',
      collector_user_id::text,
      NOW(),
      NOW(),
      NOW()
    );
    
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
    ) VALUES (
      collector_user_id,
      'Juan',
      'Dela Cruz',
      'collector@ecocollect.ph',
      '+639234567890',
      'San Pedro',
      '123 Collector St, San Pedro, Panabo City',
      'collector',
      'active',
      TRUE,
      NOW(),
      NOW()
    ) ON CONFLICT (id) DO UPDATE SET
      role = 'collector',
      status = 'active',
      email_verified = TRUE,
      updated_at = NOW();
    
    RAISE NOTICE '✅ Collector user created: collector@ecocollect.ph';
  ELSE
    UPDATE public.profiles 
    SET role = 'collector', status = 'active', email_verified = TRUE, updated_at = NOW()
    WHERE id = collector_user_id;
    RAISE NOTICE '⚠️ Collector user already exists, updated role to collector';
  END IF;
  
  -- =========================================================================
  -- CREATE COLLECTOR USER 2
  -- =========================================================================
  -- Collector account credentials:
  -- Email: collector2@ecocollect.ph
  -- Password: Collector@123456
  -- =========================================================================
  
  SELECT id INTO collector2_user_id FROM auth.users WHERE email = 'collector2@ecocollect.ph';
  
  IF collector2_user_id IS NULL THEN
    collector2_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      collector2_user_id,
      '00000000-0000-0000-0000-000000000000',
      'collector2@ecocollect.ph',
      crypt('Collector@123456', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      jsonb_build_object(
        'first_name', 'Pedro',
        'last_name', 'Santos',
        'full_name', 'Pedro Santos',
        'role', 'collector',
        'phone', '+639345678901',
        'barangay', 'New Visayas',
        'address', '456 Santos Ave, New Visayas, Panabo City'
      ),
      'authenticated',
      'authenticated',
      NOW(),
      NOW(),
      '',
      ''
    );
    
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      collector2_user_id,
      jsonb_build_object('sub', collector2_user_id::text, 'email', 'collector2@ecocollect.ph'),
      'email',
      collector2_user_id::text,
      NOW(),
      NOW(),
      NOW()
    );
    
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
    ) VALUES (
      collector2_user_id,
      'Pedro',
      'Santos',
      'collector2@ecocollect.ph',
      '+639345678901',
      'New Visayas',
      '456 Santos Ave, New Visayas, Panabo City',
      'collector',
      'active',
      TRUE,
      NOW(),
      NOW()
    ) ON CONFLICT (id) DO UPDATE SET
      role = 'collector',
      status = 'active',
      email_verified = TRUE,
      updated_at = NOW();
    
    RAISE NOTICE '✅ Collector 2 user created: collector2@ecocollect.ph';
  ELSE
    UPDATE public.profiles 
    SET role = 'collector', status = 'active', email_verified = TRUE, updated_at = NOW()
    WHERE id = collector2_user_id;
    RAISE NOTICE '⚠️ Collector 2 user already exists, updated role to collector';
  END IF;

END $$;

-- ============================================================================
-- STEP 3: Verify created accounts
-- ============================================================================
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.status,
  p.barangay,
  p.email_verified,
  p.created_at
FROM public.profiles p
WHERE p.role IN ('admin', 'collector')
ORDER BY p.role, p.created_at;

-- ============================================================================
-- SUMMARY OF CREATED ACCOUNTS
-- ============================================================================
-- 
-- | Role      | Email                      | Password          |
-- |-----------|----------------------------|-------------------|
-- | Admin     | admin@ecocollect.ph        | Admin@123456      |
-- | Collector | collector@ecocollect.ph    | Collector@123456  |
-- | Collector | collector2@ecocollect.ph   | Collector@123456  |
-- 
-- ⚠️ SECURITY WARNING: 
-- Change these passwords immediately in production!
-- These are for development/testing purposes only.
-- 
-- To change a user's password via Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Find the user and click the three dots menu
-- 3. Select "Send password recovery email" or "Reset password"
-- ============================================================================
