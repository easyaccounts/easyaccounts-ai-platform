
-- Create deliverable_threads table
CREATE TABLE public.deliverable_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id UUID NOT NULL REFERENCES public.deliverables(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create thread_messages table
CREATE TABLE public.thread_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.deliverable_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create thread_attachments table
CREATE TABLE public.thread_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.thread_messages(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.deliverable_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_attachments ENABLE ROW LEVEL SECURITY;

-- Create function to check if user can access deliverable thread
CREATE OR REPLACE FUNCTION public.can_access_deliverable_thread(thread_deliverable_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT CASE
    -- Partners can access all deliverables in their firm
    WHEN (SELECT user_role FROM public.profiles WHERE id = auth.uid()) = 'partner' THEN
      EXISTS (
        SELECT 1 FROM public.deliverables d
        WHERE d.id = thread_deliverable_id 
        AND d.firm_id = (SELECT firm_id FROM public.profiles WHERE id = auth.uid())
      )
    -- Senior staff and staff can access assigned clients' deliverables
    WHEN (SELECT user_role FROM public.profiles WHERE id = auth.uid()) IN ('senior_staff', 'staff') THEN
      EXISTS (
        SELECT 1 FROM public.deliverables d
        JOIN public.team_client_assignments tca ON d.client_id = tca.client_id
        WHERE d.id = thread_deliverable_id 
        AND tca.team_member_id = auth.uid()
      )
    -- Clients can access their own deliverables
    WHEN (SELECT user_role FROM public.profiles WHERE id = auth.uid()) = 'client' THEN
      EXISTS (
        SELECT 1 FROM public.deliverables d
        WHERE d.id = thread_deliverable_id 
        AND d.client_id = (SELECT business_id FROM public.profiles WHERE id = auth.uid())
      )
    -- Management can access their business deliverables
    WHEN (SELECT user_role FROM public.profiles WHERE id = auth.uid()) = 'management' THEN
      EXISTS (
        SELECT 1 FROM public.deliverables d
        WHERE d.id = thread_deliverable_id 
        AND d.business_id = (SELECT business_id FROM public.profiles WHERE id = auth.uid())
      )
    ELSE FALSE
  END;
$$;

-- RLS Policies for deliverable_threads
CREATE POLICY "Users can view threads for accessible deliverables"
  ON public.deliverable_threads
  FOR SELECT
  USING (public.can_access_deliverable_thread(deliverable_id));

CREATE POLICY "Users can create threads for accessible deliverables"
  ON public.deliverable_threads
  FOR INSERT
  WITH CHECK (public.can_access_deliverable_thread(deliverable_id));

-- RLS Policies for thread_messages
CREATE POLICY "Users can view messages in accessible threads"
  ON public.thread_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.deliverable_threads dt
      WHERE dt.id = thread_id
      AND public.can_access_deliverable_thread(dt.deliverable_id)
    )
  );

CREATE POLICY "Users can create messages in accessible threads"
  ON public.thread_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.deliverable_threads dt
      WHERE dt.id = thread_id
      AND public.can_access_deliverable_thread(dt.deliverable_id)
    )
  );

-- RLS Policies for thread_attachments
CREATE POLICY "Users can view attachments in accessible threads"
  ON public.thread_attachments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.thread_messages tm
      JOIN public.deliverable_threads dt ON tm.thread_id = dt.id
      WHERE tm.id = message_id
      AND public.can_access_deliverable_thread(dt.deliverable_id)
    )
  );

CREATE POLICY "Users can create attachments in accessible threads"
  ON public.thread_attachments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.thread_messages tm
      JOIN public.deliverable_threads dt ON tm.thread_id = dt.id
      WHERE tm.id = message_id
      AND public.can_access_deliverable_thread(dt.deliverable_id)
    )
  );

-- Create storage bucket for thread attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('thread-attachments', 'thread-attachments', false);

-- Storage policies for thread attachments
CREATE POLICY "Users can upload attachments for accessible threads"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'thread-attachments'
  );

CREATE POLICY "Users can view attachments for accessible threads"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'thread-attachments'
  );

CREATE POLICY "Users can delete their own attachments"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'thread-attachments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
