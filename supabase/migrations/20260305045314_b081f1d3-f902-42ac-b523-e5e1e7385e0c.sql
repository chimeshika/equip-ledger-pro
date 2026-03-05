INSERT INTO public.user_roles (user_id, role)
VALUES ('08858894-16f1-41d0-b896-1da490eca77d', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;