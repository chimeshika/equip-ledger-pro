

## Consolidated SQL Schema Script

Based on the complete database schema from your project, here is the full SQL script with all CREATE TABLE statements, enums, functions, triggers, storage buckets, and RLS policies.

### Technical Details

The script will be provided in the correct dependency order:

1. **Enums** first (`app_role`, `request_status`, `request_type`, `job_status`)
2. **Independent tables** (`branches`, `profiles`, `user_roles`)
3. **Dependent tables** (`equipment`, `user_branch_assignments`, `equipment_assignments`, `equipment_attachments`, `repairs`, `repair_requests`, `notifications`, `audit_logs`)
4. **Functions** (`has_role`, `is_admin`, `is_it_unit`, `is_branch_head`, `get_user_branch`, `handle_new_user`, `update_updated_at_column`)
5. **Triggers** (`handle_new_user` on `auth.users`, `update_updated_at` on relevant tables)
6. **RLS policies** for every table
7. **Storage bucket** (`profile-images`) with policies

Here is the complete script:

```sql
-- =============================================
-- 1. ENUMS
-- =============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'branch_head', 'it_unit', 'officer');
CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.request_type AS ENUM ('damage', 'malfunction', 'repair', 'replacement');
CREATE TYPE public.job_status AS ENUM ('received', 'diagnosing', 'repairing', 'waiting_parts', 'completed', 'replaced');

-- =============================================
-- 2. TABLES
-- =============================================

CREATE TABLE public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  address text,
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE public.user_branch_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  branch_id uuid NOT NULL REFERENCES public.branches(id),
  requested_role app_role NOT NULL DEFAULT 'officer',
  status text NOT NULL DEFAULT 'pending',
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name text NOT NULL,
  category text NOT NULL,
  brand text NOT NULL,
  serial_number text NOT NULL,
  condition text NOT NULL,
  purchase_date date,
  price numeric,
  warranty_expiry date,
  warranty_period text,
  supplier text,
  location text,
  assigned_to text,
  notes text,
  branch_id uuid REFERENCES public.branches(id),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.equipment_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES public.equipment(id),
  officer_id uuid NOT NULL,
  branch_id uuid NOT NULL REFERENCES public.branches(id),
  assigned_by uuid,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  unassigned_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  notes text
);

CREATE TABLE public.equipment_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES public.equipment(id),
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.repairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES public.equipment(id),
  description text NOT NULL,
  repair_date date NOT NULL,
  repair_cost numeric NOT NULL,
  notes text,
  bill_attachment_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.repair_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES public.equipment(id),
  requested_by uuid NOT NULL,
  branch_id uuid NOT NULL REFERENCES public.branches(id),
  description text NOT NULL,
  request_type request_type NOT NULL,
  status request_status NOT NULL DEFAULT 'pending',
  decision text,
  branch_head_decision request_status,
  branch_head_notes text,
  approved_by uuid,
  approved_at timestamptz,
  job_status job_status,
  it_assigned_to uuid,
  it_received_at timestamptz,
  repair_cost numeric,
  repair_notes text,
  replacement_equipment_id uuid REFERENCES public.equipment(id),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  related_id uuid,
  related_table text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL,
  old_values jsonb,
  new_values jsonb,
  user_id uuid,
  branch_id uuid REFERENCES public.branches(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- 3. FUNCTIONS
-- =============================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
$$;

CREATE OR REPLACE FUNCTION public.get_user_branch(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT branch_id FROM public.user_branch_assignments WHERE user_id = _user_id AND status = 'approved' LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_branch_head(_user_id uuid, _branch_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_branch_assignments uba
    JOIN public.user_roles ur ON ur.user_id = uba.user_id
    WHERE uba.user_id = _user_id AND uba.branch_id = _branch_id AND uba.status = 'approved' AND ur.role = 'branch_head'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_it_unit(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'it_unit')
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- =============================================
-- 4. TRIGGERS
-- =============================================

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_repairs_updated_at BEFORE UPDATE ON public.repairs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_repair_requests_updated_at BEFORE UPDATE ON public.repair_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_branch_assignments_updated_at BEFORE UPDATE ON public.user_branch_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 5. ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_branch_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 6. RLS POLICIES
-- =============================================

-- branches
CREATE POLICY "Authenticated users can view branches" ON public.branches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage branches" ON public.branches FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- user_roles
CREATE POLICY "Users can view their own role" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- user_branch_assignments
CREATE POLICY "Users can view their own assignment" ON public.user_branch_assignments FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can view all assignments" ON public.user_branch_assignments FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Branch heads can view their branch assignments" ON public.user_branch_assignments FOR SELECT TO authenticated USING (is_branch_head(auth.uid(), branch_id));
CREATE POLICY "Users can request branch assignment" ON public.user_branch_assignments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'pending');
CREATE POLICY "Admins can manage all assignments" ON public.user_branch_assignments FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete assignments" ON public.user_branch_assignments FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- equipment
CREATE POLICY "Users can view branch equipment" ON public.equipment FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin') OR is_it_unit(auth.uid()) OR branch_id = get_user_branch(auth.uid()) OR created_by = auth.uid());
CREATE POLICY "Users can insert equipment" ON public.equipment FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins and branch heads can update equipment" ON public.equipment FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR is_branch_head(auth.uid(), branch_id) OR created_by = auth.uid());
CREATE POLICY "Admins can delete equipment" ON public.equipment FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- equipment_assignments
CREATE POLICY "Officers can view their own assignments" ON public.equipment_assignments FOR SELECT TO authenticated USING (officer_id = auth.uid());
CREATE POLICY "Branch heads can view branch assignments" ON public.equipment_assignments FOR SELECT TO authenticated USING (is_branch_head(auth.uid(), branch_id));
CREATE POLICY "Admins can view all equipment assignments" ON public.equipment_assignments FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "IT unit can view all equipment assignments" ON public.equipment_assignments FOR SELECT TO authenticated USING (is_it_unit(auth.uid()));
CREATE POLICY "Branch heads and admins can manage assignments" ON public.equipment_assignments FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin') OR is_branch_head(auth.uid(), branch_id)) WITH CHECK (has_role(auth.uid(), 'admin') OR is_branch_head(auth.uid(), branch_id));

-- equipment_attachments
CREATE POLICY "Users can view attachments" ON public.equipment_attachments FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert attachments" ON public.equipment_attachments FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- repairs
CREATE POLICY "Users can view repairs" ON public.repairs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert repairs" ON public.repairs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- repair_requests
CREATE POLICY "Officers can view their own requests" ON public.repair_requests FOR SELECT TO authenticated USING (requested_by = auth.uid());
CREATE POLICY "Branch heads can view branch requests" ON public.repair_requests FOR SELECT TO authenticated USING (is_branch_head(auth.uid(), branch_id));
CREATE POLICY "IT unit can view approved requests" ON public.repair_requests FOR SELECT TO authenticated USING (is_it_unit(auth.uid()) AND status IN ('approved', 'in_progress', 'completed'));
CREATE POLICY "Admins can view all requests" ON public.repair_requests FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Officers can create repair requests" ON public.repair_requests FOR INSERT TO authenticated WITH CHECK (requested_by = auth.uid() AND status = 'pending');
CREATE POLICY "Branch heads can update branch requests" ON public.repair_requests FOR UPDATE TO authenticated USING (is_branch_head(auth.uid(), branch_id)) WITH CHECK (is_branch_head(auth.uid(), branch_id));
CREATE POLICY "IT unit can update approved requests" ON public.repair_requests FOR UPDATE TO authenticated USING (is_it_unit(auth.uid()) AND status IN ('approved', 'in_progress')) WITH CHECK (is_it_unit(auth.uid()));
CREATE POLICY "Admins can manage all requests" ON public.repair_requests FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Authenticated users can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- audit_logs
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Branch heads can view branch audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (branch_id IS NOT NULL AND is_branch_head(auth.uid(), branch_id));
CREATE POLICY "Users can view their own audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- =============================================
-- 7. STORAGE
-- =============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public profile images are viewable by everyone" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'profile-images');
CREATE POLICY "Users can upload to own profile folder" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can update own profile images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own profile images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### How to Use

1. Open the **SQL Editor** in your external Supabase project (`pjyhpzveyidfthxmfdz`)
2. Paste the entire script above
3. Click **Run**
4. All 11 tables, enums, functions, triggers, RLS policies, and storage will be created

Note: The `on_auth_user_created` trigger references `auth.users`, which already exists in every Supabase project. If you already have a trigger with that name, drop it first with `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`.

