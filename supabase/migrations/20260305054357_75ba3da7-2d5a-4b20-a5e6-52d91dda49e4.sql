
-- Fix ALL RLS policies to be PERMISSIVE (currently all are RESTRICTIVE which breaks access)

-- =================== user_roles ===================
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can view their own role" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- =================== profiles ===================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- =================== branches ===================
DROP POLICY IF EXISTS "Authenticated users can view branches" ON public.branches;
DROP POLICY IF EXISTS "Admins can manage branches" ON public.branches;

CREATE POLICY "Authenticated users can view branches" ON public.branches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage branches" ON public.branches FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- =================== user_branch_assignments ===================
DROP POLICY IF EXISTS "Users can view their own assignment" ON public.user_branch_assignments;
DROP POLICY IF EXISTS "Admins can view all assignments" ON public.user_branch_assignments;
DROP POLICY IF EXISTS "Branch heads can view their branch assignments" ON public.user_branch_assignments;
DROP POLICY IF EXISTS "Users can request branch assignment" ON public.user_branch_assignments;
DROP POLICY IF EXISTS "Admins can manage all assignments" ON public.user_branch_assignments;
DROP POLICY IF EXISTS "Admins can delete assignments" ON public.user_branch_assignments;

CREATE POLICY "Users can view their own assignment" ON public.user_branch_assignments FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can view all assignments" ON public.user_branch_assignments FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Branch heads can view their branch assignments" ON public.user_branch_assignments FOR SELECT TO authenticated USING (is_branch_head(auth.uid(), branch_id));
CREATE POLICY "Users can request branch assignment" ON public.user_branch_assignments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'pending');
CREATE POLICY "Admins can manage all assignments" ON public.user_branch_assignments FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete assignments" ON public.user_branch_assignments FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- =================== equipment ===================
DROP POLICY IF EXISTS "Users can view branch equipment" ON public.equipment;
DROP POLICY IF EXISTS "Users can insert equipment" ON public.equipment;
DROP POLICY IF EXISTS "Admins and branch heads can update equipment" ON public.equipment;
DROP POLICY IF EXISTS "Admins can delete equipment" ON public.equipment;

CREATE POLICY "Users can view branch equipment" ON public.equipment FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin') OR is_it_unit(auth.uid()) OR branch_id = get_user_branch(auth.uid()) OR created_by = auth.uid());
CREATE POLICY "Users can insert equipment" ON public.equipment FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins and branch heads can update equipment" ON public.equipment FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR is_branch_head(auth.uid(), branch_id) OR created_by = auth.uid());
CREATE POLICY "Admins can delete equipment" ON public.equipment FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- =================== equipment_assignments ===================
DROP POLICY IF EXISTS "Officers can view their own assignments" ON public.equipment_assignments;
DROP POLICY IF EXISTS "Branch heads can view branch assignments" ON public.equipment_assignments;
DROP POLICY IF EXISTS "Admins can view all equipment assignments" ON public.equipment_assignments;
DROP POLICY IF EXISTS "IT unit can view all equipment assignments" ON public.equipment_assignments;
DROP POLICY IF EXISTS "Branch heads and admins can manage assignments" ON public.equipment_assignments;

CREATE POLICY "Officers can view their own assignments" ON public.equipment_assignments FOR SELECT TO authenticated USING (officer_id = auth.uid());
CREATE POLICY "Branch heads can view branch assignments" ON public.equipment_assignments FOR SELECT TO authenticated USING (is_branch_head(auth.uid(), branch_id));
CREATE POLICY "Admins can view all equipment assignments" ON public.equipment_assignments FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "IT unit can view all equipment assignments" ON public.equipment_assignments FOR SELECT TO authenticated USING (is_it_unit(auth.uid()));
CREATE POLICY "Branch heads and admins can manage assignments" ON public.equipment_assignments FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin') OR is_branch_head(auth.uid(), branch_id)) WITH CHECK (has_role(auth.uid(), 'admin') OR is_branch_head(auth.uid(), branch_id));

-- =================== equipment_attachments ===================
DROP POLICY IF EXISTS "Users can view attachments" ON public.equipment_attachments;
DROP POLICY IF EXISTS "Users can insert attachments" ON public.equipment_attachments;

CREATE POLICY "Users can view attachments" ON public.equipment_attachments FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert attachments" ON public.equipment_attachments FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- =================== repairs ===================
DROP POLICY IF EXISTS "Users can view repairs" ON public.repairs;
DROP POLICY IF EXISTS "Users can insert repairs" ON public.repairs;

CREATE POLICY "Users can view repairs" ON public.repairs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert repairs" ON public.repairs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- =================== repair_requests ===================
DROP POLICY IF EXISTS "Officers can view their own requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Branch heads can view branch requests" ON public.repair_requests;
DROP POLICY IF EXISTS "IT unit can view approved requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Officers can create repair requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Branch heads can update branch requests" ON public.repair_requests;
DROP POLICY IF EXISTS "IT unit can update approved requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Admins can manage all requests" ON public.repair_requests;

CREATE POLICY "Officers can view their own requests" ON public.repair_requests FOR SELECT TO authenticated USING (requested_by = auth.uid());
CREATE POLICY "Branch heads can view branch requests" ON public.repair_requests FOR SELECT TO authenticated USING (is_branch_head(auth.uid(), branch_id));
CREATE POLICY "IT unit can view approved requests" ON public.repair_requests FOR SELECT TO authenticated USING (is_it_unit(auth.uid()) AND status IN ('approved', 'in_progress', 'completed'));
CREATE POLICY "Admins can view all requests" ON public.repair_requests FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Officers can create repair requests" ON public.repair_requests FOR INSERT TO authenticated WITH CHECK (requested_by = auth.uid() AND status = 'pending');
CREATE POLICY "Branch heads can update branch requests" ON public.repair_requests FOR UPDATE TO authenticated USING (is_branch_head(auth.uid(), branch_id)) WITH CHECK (is_branch_head(auth.uid(), branch_id));
CREATE POLICY "IT unit can update approved requests" ON public.repair_requests FOR UPDATE TO authenticated USING (is_it_unit(auth.uid()) AND status IN ('approved', 'in_progress')) WITH CHECK (is_it_unit(auth.uid()));
CREATE POLICY "Admins can manage all requests" ON public.repair_requests FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- =================== notifications ===================
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Authenticated users can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- =================== audit_logs ===================
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Branch heads can view branch audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;

CREATE POLICY "Admins can view all audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Branch heads can view branch audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (branch_id IS NOT NULL AND is_branch_head(auth.uid(), branch_id));
CREATE POLICY "Users can view their own audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
