-- Fix RLS policies to explicitly require authentication

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own equipment" ON public.equipment;
DROP POLICY IF EXISTS "Users can view repairs for their equipment" ON public.repairs;
DROP POLICY IF EXISTS "Users can view attachments for their equipment" ON public.equipment_attachments;

-- Profiles: Users can view their own profile, admins can view all
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- User roles: Users can view their own roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Equipment: Users can view their own equipment, admins can view all
CREATE POLICY "Users can view their own equipment" 
ON public.equipment 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role)));

-- Repairs: Users can view repairs for their equipment, admins can view all
CREATE POLICY "Users can view repairs for their equipment" 
ON public.repairs 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1
    FROM equipment
    WHERE equipment.id = repairs.equipment_id 
    AND (equipment.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Equipment attachments: Users can view attachments for their equipment, admins can view all
CREATE POLICY "Users can view attachments for their equipment" 
ON public.equipment_attachments 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1
    FROM equipment
    WHERE equipment.id = equipment_attachments.equipment_id 
    AND (equipment.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);