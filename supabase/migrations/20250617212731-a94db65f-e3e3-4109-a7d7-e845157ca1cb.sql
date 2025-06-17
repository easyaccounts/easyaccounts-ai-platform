
-- Create team_client_assignments table
CREATE TABLE public.team_client_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure no duplicate assignments
  UNIQUE(team_member_id, client_id)
);

-- Enable Row Level Security
ALTER TABLE public.team_client_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Partners can view all assignments they made or for their firm
CREATE POLICY "Partners can view firm assignments" 
ON public.team_client_assignments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.user_role = 'partner' 
    AND p.firm_id = (
      SELECT firm_id FROM public.profiles WHERE id = team_member_id
    )
  )
);

-- Policy: Team members can view their own assignments
CREATE POLICY "Team members can view own assignments" 
ON public.team_client_assignments 
FOR SELECT 
USING (team_member_id = auth.uid());

-- Policy: Only partners can insert assignments
CREATE POLICY "Only partners can create assignments" 
ON public.team_client_assignments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.user_role = 'partner'
  )
  AND assigned_by = auth.uid()
);

-- Policy: Only the assigning partner can update assignments
CREATE POLICY "Only assigning partner can update" 
ON public.team_client_assignments 
FOR UPDATE 
USING (assigned_by = auth.uid());

-- Policy: Only the assigning partner can delete assignments
CREATE POLICY "Only assigning partner can delete" 
ON public.team_client_assignments 
FOR DELETE 
USING (assigned_by = auth.uid());

-- Create index for better performance
CREATE INDEX idx_team_client_assignments_team_member ON public.team_client_assignments(team_member_id);
CREATE INDEX idx_team_client_assignments_client ON public.team_client_assignments(client_id);
CREATE INDEX idx_team_client_assignments_assigned_by ON public.team_client_assignments(assigned_by);

-- Create function to get assigned clients for current user
CREATE OR REPLACE FUNCTION public.get_user_assigned_clients()
RETURNS TABLE(client_id UUID)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT tca.client_id
  FROM public.team_client_assignments tca
  WHERE tca.team_member_id = auth.uid();
$$;

-- Create function to check if user can access client
CREATE OR REPLACE FUNCTION public.can_access_client(target_client_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT CASE 
    WHEN (SELECT user_role FROM public.profiles WHERE id = auth.uid()) = 'partner' THEN TRUE
    WHEN EXISTS (
      SELECT 1 FROM public.team_client_assignments tca 
      WHERE tca.team_member_id = auth.uid() 
      AND tca.client_id = target_client_id
    ) THEN TRUE
    ELSE FALSE
  END;
$$;
