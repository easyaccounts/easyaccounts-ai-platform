
-- Create deliverable_tasks table
CREATE TABLE public.deliverable_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id UUID NOT NULL REFERENCES public.deliverables(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id)
);

-- Create task_assignments table
CREATE TABLE public.task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.deliverable_tasks(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES public.profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure no duplicate assignments per task
  UNIQUE(task_id, assigned_to)
);

-- Create task_comments table for discussions
CREATE TABLE public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.deliverable_tasks(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.deliverable_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deliverable_tasks
-- Partners can see all tasks for their firm's deliverables
CREATE POLICY "Partners can view all firm tasks" 
ON public.deliverable_tasks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.deliverables d
    JOIN public.clients c ON d.client_id = c.id
    WHERE d.id = deliverable_id
    AND c.firm_id = (SELECT firm_id FROM public.profiles WHERE id = auth.uid())
    AND (SELECT user_role FROM public.profiles WHERE id = auth.uid()) = 'partner'
  )
);

-- Team members can see tasks for deliverables of assigned clients
CREATE POLICY "Team members can view assigned client tasks" 
ON public.deliverable_tasks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.deliverables d
    JOIN public.team_client_assignments tca ON d.client_id = tca.client_id
    WHERE d.id = deliverable_id
    AND tca.team_member_id = auth.uid()
  )
);

-- Partners and seniors can insert tasks
CREATE POLICY "Partners and seniors can create tasks" 
ON public.deliverable_tasks 
FOR INSERT 
WITH CHECK (
  (SELECT user_role FROM public.profiles WHERE id = auth.uid()) IN ('partner', 'senior_staff')
  AND created_by = auth.uid()
);

-- Task creators and partners can update tasks
CREATE POLICY "Task creators and partners can update tasks" 
ON public.deliverable_tasks 
FOR UPDATE 
USING (
  created_by = auth.uid() 
  OR (SELECT user_role FROM public.profiles WHERE id = auth.uid()) = 'partner'
);

-- RLS Policies for task_assignments
-- View assignments for accessible tasks
CREATE POLICY "View assignments for accessible tasks" 
ON public.task_assignments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.deliverable_tasks dt
    WHERE dt.id = task_id
  )
);

-- Partners and seniors can create assignments
CREATE POLICY "Partners and seniors can assign tasks" 
ON public.task_assignments 
FOR INSERT 
WITH CHECK (
  (SELECT user_role FROM public.profiles WHERE id = auth.uid()) IN ('partner', 'senior_staff')
  AND assigned_by = auth.uid()
);

-- Assigners can update/delete assignments
CREATE POLICY "Assigners can manage assignments" 
ON public.task_assignments 
FOR ALL 
USING (assigned_by = auth.uid());

-- RLS Policies for task_comments
-- View comments for accessible tasks
CREATE POLICY "View comments for accessible tasks" 
ON public.task_comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.deliverable_tasks dt
    WHERE dt.id = task_id
  )
);

-- Anyone who can see the task can comment
CREATE POLICY "Can comment on accessible tasks" 
ON public.task_comments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.deliverable_tasks dt
    WHERE dt.id = task_id
  )
  AND created_by = auth.uid()
);

-- Comment creators can update their comments
CREATE POLICY "Can update own comments" 
ON public.task_comments 
FOR UPDATE 
USING (created_by = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_deliverable_tasks_deliverable_id ON public.deliverable_tasks(deliverable_id);
CREATE INDEX idx_deliverable_tasks_status ON public.deliverable_tasks(status);
CREATE INDEX idx_deliverable_tasks_due_date ON public.deliverable_tasks(due_date);
CREATE INDEX idx_task_assignments_task_id ON public.task_assignments(task_id);
CREATE INDEX idx_task_assignments_assigned_to ON public.task_assignments(assigned_to);
CREATE INDEX idx_task_comments_task_id ON public.task_comments(task_id);

-- Create function to get user's assigned tasks
CREATE OR REPLACE FUNCTION public.get_user_assigned_tasks()
RETURNS TABLE(
  task_id UUID,
  deliverable_id UUID,
  client_id UUID,
  title TEXT,
  status TEXT,
  due_date DATE
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    dt.id,
    dt.deliverable_id,
    d.client_id,
    dt.title,
    dt.status,
    dt.due_date
  FROM public.deliverable_tasks dt
  JOIN public.task_assignments ta ON dt.id = ta.task_id
  JOIN public.deliverables d ON dt.deliverable_id = d.id
  WHERE ta.assigned_to = auth.uid();
$$;
