import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database['public']['Enums']['app_role'];

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Super Admin",
  director: "Director",
  branch_head: "Branch Head",
  it_unit: "IT Unit",
  it_assistant: "IT Assistant",
  officer: "Officer",
  mso: "MSO",
  user: "User",
};

export const ALL_ROLES: AppRole[] = [
  'admin', 'director', 'branch_head', 'it_unit', 'it_assistant', 'officer', 'mso', 'user'
];

/** Roles that have global (all-branch) access */
export const GLOBAL_ROLES: AppRole[] = ['admin', 'director', 'it_unit'];

/** Check if a role has global branch access */
export const hasGlobalAccess = (role?: AppRole): boolean =>
  !!role && GLOBAL_ROLES.includes(role);
