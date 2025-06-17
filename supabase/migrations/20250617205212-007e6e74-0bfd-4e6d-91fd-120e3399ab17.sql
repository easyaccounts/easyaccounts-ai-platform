
-- Add status column to profiles table for team management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Add phone column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create user_assignments table to track client assignments
CREATE TABLE IF NOT EXISTS public.user_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, client_id)
);

-- Add RLS policies for user_assignments
ALTER TABLE public.user_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Firm members can view assignments" ON public.user_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p1, public.profiles p2
      WHERE p1.id = auth.uid() 
      AND p2.id = user_assignments.user_id
      AND p1.firm_id = p2.firm_id
      AND p1.firm_id IS NOT NULL
    )
  );

CREATE POLICY "Partners can manage assignments" ON public.user_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_role = 'partner'
      AND firm_id IS NOT NULL
    )
  );

-- Create user_sessions table for view mode context
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  view_mode TEXT DEFAULT 'firm' CHECK (view_mode IN ('firm', 'client')),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own session" ON public.user_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Function to get current user's view mode
CREATE OR REPLACE FUNCTION public.get_current_user_view_mode()
RETURNS TEXT AS $$
  SELECT COALESCE(view_mode, 'firm') FROM public.user_sessions WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Function to set user view mode
CREATE OR REPLACE FUNCTION public.set_user_view_mode(new_mode TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_sessions (user_id, view_mode)
  VALUES (auth.uid(), new_mode)
  ON CONFLICT (user_id)
  DO UPDATE SET view_mode = new_mode, updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
