-- ============================================
-- SECURITY FIX: Privilege Escalation & RLS
-- ============================================

-- 1. Create user_roles table with proper separation
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (user_id, role)
);

-- 2. Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for user_roles (only admins can manage)
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
    )
  );

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 5. Update has_role function to use user_roles table
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 6. Drop the dependent policy first, THEN drop role column
DROP POLICY IF EXISTS "Only admins can update user roles" ON public.profiles;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- ============================================
-- FIX RLS POLICIES - Remove Public Access
-- ============================================

-- PROFILES TABLE: Remove public access, restrict to authenticated users
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Update existing update policies to use has_role
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- EQUIPMENT TABLE: Remove public access, restrict to owners and admins
DROP POLICY IF EXISTS "Anyone can view equipment" ON public.equipment;
DROP POLICY IF EXISTS "Everyone can view equipment" ON public.equipment;
DROP POLICY IF EXISTS "Users can delete their own equipment" ON public.equipment;
DROP POLICY IF EXISTS "Users can update their own equipment" ON public.equipment;
DROP POLICY IF EXISTS "Authenticated users can create equipment" ON public.equipment;

CREATE POLICY "Users can view their own equipment" ON public.equipment
  FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own equipment" ON public.equipment
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own equipment" ON public.equipment
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can delete their own equipment or admins can delete any" ON public.equipment;

CREATE POLICY "Users can delete their own equipment" ON public.equipment
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- REPAIRS TABLE: Remove public access, restrict to equipment owners
DROP POLICY IF EXISTS "Anyone can view repairs" ON public.repairs;
DROP POLICY IF EXISTS "Anyone can update repairs" ON public.repairs;
DROP POLICY IF EXISTS "Anyone can delete repairs" ON public.repairs;
DROP POLICY IF EXISTS "Authenticated users can create repairs" ON public.repairs;

CREATE POLICY "Users can view repairs for their equipment" ON public.repairs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.equipment
      WHERE equipment.id = repairs.equipment_id
      AND (equipment.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can insert repairs for their equipment" ON public.repairs
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.equipment
      WHERE equipment.id = repairs.equipment_id
      AND (equipment.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can update repairs for their equipment" ON public.repairs
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.equipment
      WHERE equipment.id = repairs.equipment_id
      AND (equipment.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.equipment
      WHERE equipment.id = repairs.equipment_id
      AND (equipment.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can delete repairs for their equipment" ON public.repairs
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.equipment
      WHERE equipment.id = repairs.equipment_id
      AND (equipment.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

-- EQUIPMENT_ATTACHMENTS TABLE: Remove public access
DROP POLICY IF EXISTS "Anyone can view attachments" ON public.equipment_attachments;
DROP POLICY IF EXISTS "Anyone can update attachments" ON public.equipment_attachments;
DROP POLICY IF EXISTS "Anyone can delete attachments" ON public.equipment_attachments;
DROP POLICY IF EXISTS "Authenticated users can create attachments" ON public.equipment_attachments;

CREATE POLICY "Users can view attachments for their equipment" ON public.equipment_attachments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.equipment
      WHERE equipment.id = equipment_attachments.equipment_id
      AND (equipment.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can insert attachments for their equipment" ON public.equipment_attachments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.equipment
      WHERE equipment.id = equipment_attachments.equipment_id
      AND (equipment.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can update attachments for their equipment" ON public.equipment_attachments
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.equipment
      WHERE equipment.id = equipment_attachments.equipment_id
      AND (equipment.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.equipment
      WHERE equipment.id = equipment_attachments.equipment_id
      AND (equipment.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can delete attachments for their equipment" ON public.equipment_attachments
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.equipment
      WHERE equipment.id = equipment_attachments.equipment_id
      AND (equipment.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

-- Update handle_new_user function to assign default user role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email),
    new.raw_user_meta_data ->> 'phone'
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user'::app_role);
  
  RETURN new;
END;
$function$;