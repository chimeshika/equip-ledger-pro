
-- Add new roles to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'director';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'mso';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'it_assistant';

-- Allow branch heads to update assignments in their branch
CREATE POLICY "Branch heads can update branch assignments"
ON public.user_branch_assignments
FOR UPDATE
USING (is_branch_head(auth.uid(), branch_id))
WITH CHECK (is_branch_head(auth.uid(), branch_id));

-- Allow branch heads to delete assignments in their branch
CREATE POLICY "Branch heads can delete branch assignments"
ON public.user_branch_assignments
FOR DELETE
USING (is_branch_head(auth.uid(), branch_id));

-- Allow branch heads to view all profiles (needed to display user names)
CREATE POLICY "Branch heads can view profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'branch_head'
  )
);

-- Allow IT unit to view all profiles
CREATE POLICY "IT unit can view profiles"
ON public.profiles
FOR SELECT
USING (is_it_unit(auth.uid()));

-- Allow branch heads to view user roles in their branch
CREATE POLICY "Branch heads can view roles"
ON public.user_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'branch_head'
  )
);
