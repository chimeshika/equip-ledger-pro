
-- Ensure super admin (chimeshikabandara@gmail.com) always has admin role
-- This function runs as a trigger to prevent accidental lockout
CREATE OR REPLACE FUNCTION public.ensure_super_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  super_admin_id uuid;
BEGIN
  -- Find the super admin user
  SELECT id INTO super_admin_id
  FROM public.profiles
  WHERE email = 'chimeshikabandara@gmail.com'
  LIMIT 1;

  -- If this deletion targets the super admin's admin role, prevent it
  IF super_admin_id IS NOT NULL AND OLD.user_id = super_admin_id AND OLD.role = 'admin' THEN
    RAISE EXCEPTION 'Cannot remove admin role from the Super Admin account';
  END IF;

  RETURN OLD;
END;
$$;

-- Trigger to protect super admin role from deletion
DROP TRIGGER IF EXISTS protect_super_admin_role ON public.user_roles;
CREATE TRIGGER protect_super_admin_role
  BEFORE DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_super_admin();
