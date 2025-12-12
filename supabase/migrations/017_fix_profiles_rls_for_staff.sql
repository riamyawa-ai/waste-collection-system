-- Migration to fix profiles RLS policy for staff access
-- Using JWT metadata as primary check to avoid recursion, falling back to get_user_role

DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;

CREATE POLICY "Staff can view all profiles"
  ON profiles FOR SELECT
  USING (
    -- Check JWT metadata first (faster, no db hit, no recursion)
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('staff', 'admin')
    OR
    -- Fallback to the secure function
    public.get_user_role(auth.uid()) IN ('staff', 'admin')
  );

-- Also ensure the get_user_role function is definitely SECURITY DEFINER
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

-- Grant execution to authenticated users just in case
GRANT EXECUTE ON FUNCTION public.get_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role TO service_role;
