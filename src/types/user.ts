
export type UserGroup = 'chartered_accountant' | 'business_owner';

export type UserRole = 'partner' | 'senior' | 'staff' | 'client' | 'management' | 'accounting_team';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  user_group: UserGroup;
  user_role: UserRole;
  firm_id?: string;
  business_id?: string;
  firm_name?: string;
  business_name?: string;
  phone?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}
