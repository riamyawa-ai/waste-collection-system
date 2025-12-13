-- Migration: Fix Infinite Recursion in Profiles RLS
-- Correcting the policy introduced in 022 that caused recursion by querying profiles directly.

-- Drop the recursive policy
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;

-- Recreate it using the safe SECURITY DEFINER function or JWT metadata
-- ensuring we don't trigger the policy again during the check.

CREATE POLICY "Staff can view all profiles"
  ON profiles FOR SELECT
  USING (
    -- 1. Users can always see their own profile
    id = auth.uid()
    OR
    -- 2. Staff and Admins can see all profiles
    -- We use get_user_role() which is SECURITY DEFINER to bypass RLS and avoid recursion
    public.get_user_role(auth.uid()) IN ('staff', 'admin')
  );

-- Just to be absolutely sure, verify get_user_role is still SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  _role text;
BEGIN
  SELECT role INTO _role FROM public.profiles WHERE id = user_id;
  RETURN _role;
END;
$function$;
