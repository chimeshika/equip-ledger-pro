
ALTER TABLE public.user_branch_assignments 
  ADD COLUMN IF NOT EXISTS designation text,
  ADD COLUMN IF NOT EXISTS post_order integer,
  ADD COLUMN IF NOT EXISTS supervisor_id uuid REFERENCES public.profiles(id);
