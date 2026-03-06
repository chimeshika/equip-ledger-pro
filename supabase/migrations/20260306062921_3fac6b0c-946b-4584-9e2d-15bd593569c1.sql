
-- Fix: Convert RESTRICTIVE policies to PERMISSIVE on user_branch_assignments
DROP POLICY IF EXISTS "Admins can delete assignments" ON public.user_branch_assignments;
DROP POLICY IF EXISTS "Admins can manage all assignments" ON public.user_branch_assignments;
DROP POLICY IF EXISTS "Admins can view all assignments" ON public.user_branch_assignments;
DROP POLICY IF EXISTS "Branch heads can view their branch assignments" ON public.user_branch_assignments;
DROP POLICY IF EXISTS "Users can request branch assignment" ON public.user_branch_assignments;
DROP POLICY IF EXISTS "Users can view their own assignment" ON public.user_branch_assignments;

CREATE POLICY "Admins can view all assignments" ON public.user_branch_assignments FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update all assignments" ON public.user_branch_assignments FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete assignments" ON public.user_branch_assignments FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Branch heads can view their branch assignments" ON public.user_branch_assignments FOR SELECT USING (is_branch_head(auth.uid(), branch_id));
CREATE POLICY "Users can request branch assignment" ON public.user_branch_assignments FOR INSERT WITH CHECK ((user_id = auth.uid()) AND (status = 'pending'::text));
CREATE POLICY "Users can view their own assignment" ON public.user_branch_assignments FOR SELECT USING (user_id = auth.uid());

-- Fix: Convert RESTRICTIVE policies to PERMISSIVE on profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Fix: Convert RESTRICTIVE policies to PERMISSIVE on user_roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view their own role" ON public.user_roles FOR SELECT USING (user_id = auth.uid());

-- Fix: Convert RESTRICTIVE policies to PERMISSIVE on branches
DROP POLICY IF EXISTS "Admins can manage branches" ON public.branches;
DROP POLICY IF EXISTS "Authenticated users can view branches" ON public.branches;

CREATE POLICY "Admins can manage branches" ON public.branches FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated users can view branches" ON public.branches FOR SELECT USING (true);

-- Fix: Convert RESTRICTIVE policies to PERMISSIVE on equipment
DROP POLICY IF EXISTS "Admins and branch heads can update equipment" ON public.equipment;
DROP POLICY IF EXISTS "Admins can delete equipment" ON public.equipment;
DROP POLICY IF EXISTS "Users can insert equipment" ON public.equipment;
DROP POLICY IF EXISTS "Users can view branch equipment" ON public.equipment;

CREATE POLICY "Admins and branch heads can update equipment" ON public.equipment FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR is_branch_head(auth.uid(), branch_id) OR (created_by = auth.uid()));
CREATE POLICY "Admins can delete equipment" ON public.equipment FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can insert equipment" ON public.equipment FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can view branch equipment" ON public.equipment FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR is_it_unit(auth.uid()) OR (branch_id = get_user_branch(auth.uid())) OR (created_by = auth.uid()));

-- Fix: Convert RESTRICTIVE policies to PERMISSIVE on notifications
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;

CREATE POLICY "Authenticated users can create notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
