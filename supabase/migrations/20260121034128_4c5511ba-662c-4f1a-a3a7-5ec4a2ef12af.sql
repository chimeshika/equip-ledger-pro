-- =====================================================
-- Complete Database Setup for Branch-wise Equipment Control
-- =====================================================

-- 1. Create app_role enum with all roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'branch_head', 'it_unit', 'officer');

-- 2. Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create branches table
CREATE TABLE public.branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  address TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- 5. Create user_branch_assignments table
CREATE TABLE public.user_branch_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  requested_role public.app_role NOT NULL DEFAULT 'officer',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_branch_assignments ENABLE ROW LEVEL SECURITY;

-- 6. Create equipment table
CREATE TABLE public.equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  serial_number TEXT NOT NULL UNIQUE,
  purchase_date DATE,
  supplier TEXT,
  price NUMERIC(15,2),
  warranty_period TEXT,
  warranty_expiry DATE,
  location TEXT,
  assigned_to TEXT,
  condition TEXT NOT NULL,
  notes TEXT,
  branch_id UUID REFERENCES public.branches(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

-- 7. Create equipment_attachments table
CREATE TABLE public.equipment_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.equipment_attachments ENABLE ROW LEVEL SECURITY;

-- 8. Create repairs table
CREATE TABLE public.repairs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  repair_date DATE NOT NULL,
  repair_cost NUMERIC(15,2) NOT NULL,
  description TEXT NOT NULL,
  notes TEXT,
  bill_attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.repairs ENABLE ROW LEVEL SECURITY;

-- 9. Create enums for repair workflow
CREATE TYPE public.request_type AS ENUM ('damage', 'malfunction', 'repair', 'replacement');
CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.job_status AS ENUM ('received', 'diagnosing', 'repairing', 'waiting_parts', 'completed', 'replaced');

-- 10. Create repair_requests table
CREATE TABLE public.repair_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  request_type public.request_type NOT NULL,
  description TEXT NOT NULL,
  status public.request_status NOT NULL DEFAULT 'pending',
  branch_head_decision public.request_status,
  branch_head_notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  job_status public.job_status,
  it_assigned_to UUID REFERENCES auth.users(id),
  it_received_at TIMESTAMP WITH TIME ZONE,
  repair_cost NUMERIC(15,2),
  repair_notes TEXT,
  decision TEXT CHECK (decision IN ('repair', 'replace')),
  completed_at TIMESTAMP WITH TIME ZONE,
  replacement_equipment_id UUID REFERENCES public.equipment(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.repair_requests ENABLE ROW LEVEL SECURITY;

-- 11. Create equipment_assignments table
CREATE TABLE public.equipment_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  officer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unassigned_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT
);

ALTER TABLE public.equipment_assignments ENABLE ROW LEVEL SECURITY;

-- 12. Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES auth.users(id),
  branch_id UUID REFERENCES public.branches(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 13. Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  related_table TEXT,
  related_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 14. Create helper functions

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
$$;

-- Function to get user's branch
CREATE OR REPLACE FUNCTION public.get_user_branch(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT branch_id FROM public.user_branch_assignments 
  WHERE user_id = _user_id AND status = 'approved'
  LIMIT 1
$$;

-- Function to check if user is branch head of a specific branch
CREATE OR REPLACE FUNCTION public.is_branch_head(_user_id UUID, _branch_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_branch_assignments uba
    JOIN public.user_roles ur ON ur.user_id = uba.user_id
    WHERE uba.user_id = _user_id 
    AND uba.branch_id = _branch_id 
    AND uba.status = 'approved'
    AND ur.role = 'branch_head'
  )
$$;

-- Function to check if user is IT unit member
CREATE OR REPLACE FUNCTION public.is_it_unit(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'it_unit'
  )
$$;

-- 15. Create triggers for updated_at
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER equipment_updated_at BEFORE UPDATE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER repairs_updated_at BEFORE UPDATE ON public.repairs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER branches_updated_at BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER user_branch_assignments_updated_at BEFORE UPDATE ON public.user_branch_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER repair_requests_updated_at BEFORE UPDATE ON public.repair_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 16. Create RLS Policies

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Branches policies
CREATE POLICY "Authenticated users can view branches" ON public.branches
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage branches" ON public.branches
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- User branch assignments policies
CREATE POLICY "Users can view their own assignment" ON public.user_branch_assignments
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can view all assignments" ON public.user_branch_assignments
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Branch heads can view their branch assignments" ON public.user_branch_assignments
  FOR SELECT TO authenticated USING (public.is_branch_head(auth.uid(), branch_id));

CREATE POLICY "Users can request branch assignment" ON public.user_branch_assignments
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins can manage all assignments" ON public.user_branch_assignments
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete assignments" ON public.user_branch_assignments
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Equipment policies
CREATE POLICY "Users can view branch equipment" ON public.equipment
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.is_it_unit(auth.uid()) OR
    branch_id = public.get_user_branch(auth.uid()) OR
    created_by = auth.uid()
  );

CREATE POLICY "Users can insert equipment" ON public.equipment
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and branch heads can update equipment" ON public.equipment
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.is_branch_head(auth.uid(), branch_id) OR
    created_by = auth.uid()
  );

CREATE POLICY "Admins can delete equipment" ON public.equipment
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Equipment attachments policies
CREATE POLICY "Users can view attachments" ON public.equipment_attachments
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert attachments" ON public.equipment_attachments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- Repairs policies
CREATE POLICY "Users can view repairs" ON public.repairs
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert repairs" ON public.repairs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- Equipment assignments policies
CREATE POLICY "Officers can view their own assignments" ON public.equipment_assignments
  FOR SELECT TO authenticated USING (officer_id = auth.uid());

CREATE POLICY "Branch heads can view branch assignments" ON public.equipment_assignments
  FOR SELECT TO authenticated USING (public.is_branch_head(auth.uid(), branch_id));

CREATE POLICY "Admins can view all equipment assignments" ON public.equipment_assignments
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "IT unit can view all equipment assignments" ON public.equipment_assignments
  FOR SELECT TO authenticated USING (public.is_it_unit(auth.uid()));

CREATE POLICY "Branch heads and admins can manage assignments" ON public.equipment_assignments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_branch_head(auth.uid(), branch_id))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_branch_head(auth.uid(), branch_id));

-- Repair requests policies
CREATE POLICY "Officers can view their own requests" ON public.repair_requests
  FOR SELECT TO authenticated USING (requested_by = auth.uid());

CREATE POLICY "Branch heads can view branch requests" ON public.repair_requests
  FOR SELECT TO authenticated USING (public.is_branch_head(auth.uid(), branch_id));

CREATE POLICY "IT unit can view approved requests" ON public.repair_requests
  FOR SELECT TO authenticated
  USING (public.is_it_unit(auth.uid()) AND status IN ('approved', 'in_progress', 'completed'));

CREATE POLICY "Admins can view all requests" ON public.repair_requests
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Officers can create repair requests" ON public.repair_requests
  FOR INSERT TO authenticated WITH CHECK (requested_by = auth.uid() AND status = 'pending');

CREATE POLICY "Branch heads can update branch requests" ON public.repair_requests
  FOR UPDATE TO authenticated
  USING (public.is_branch_head(auth.uid(), branch_id))
  WITH CHECK (public.is_branch_head(auth.uid(), branch_id));

CREATE POLICY "IT unit can update approved requests" ON public.repair_requests
  FOR UPDATE TO authenticated
  USING (public.is_it_unit(auth.uid()) AND status IN ('approved', 'in_progress'))
  WITH CHECK (public.is_it_unit(auth.uid()));

CREATE POLICY "Admins can manage all requests" ON public.repair_requests
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Audit logs policies
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Branch heads can view branch audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (branch_id IS NOT NULL AND public.is_branch_head(auth.uid(), branch_id));

CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- 17. Create trigger for auto-creating profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 18. Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;