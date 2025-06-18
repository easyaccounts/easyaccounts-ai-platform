
-- Update the existing transactions table to support the new structure (fixed version)
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS cycle TEXT CHECK (cycle IN ('sales_receipts', 'purchases_payments', 'inventory', 'journal_entries', 'payroll', 'banking', 'taxes', 'custom')),
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved')) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS source TEXT CHECK (source IN ('manual', 'upload', 'import')) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS lines JSONB,
ADD COLUMN IF NOT EXISTS document_url TEXT,
ADD COLUMN IF NOT EXISTS deliverable_id UUID REFERENCES public.deliverables(id);

-- Only add narration column if description doesn't exist, otherwise rename description to narration
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'description') THEN
        ALTER TABLE public.transactions RENAME COLUMN description TO narration;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'narration') THEN
        ALTER TABLE public.transactions ADD COLUMN narration TEXT;
    END IF;
END $$;

-- Create transaction_comments table
CREATE TABLE IF NOT EXISTS public.transaction_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create transaction_review_log table
CREATE TABLE IF NOT EXISTS public.transaction_review_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT CHECK (action IN ('submitted', 'reviewed', 'approved', 'rejected', 'returned')) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create transaction_documents table
CREATE TABLE IF NOT EXISTS public.transaction_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.transaction_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_review_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transaction_comments
DROP POLICY IF EXISTS "Users can view comments for accessible transactions" ON public.transaction_comments;
DROP POLICY IF EXISTS "Users can create comments for accessible transactions" ON public.transaction_comments;

CREATE POLICY "Users can view comments for accessible transactions"
  ON public.transaction_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = transaction_id
      AND public.can_access_client(t.client_id)
    )
  );

CREATE POLICY "Users can create comments for accessible transactions"
  ON public.transaction_comments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = transaction_id
      AND public.can_access_client(t.client_id)
    )
  );

-- RLS Policies for transaction_review_log
DROP POLICY IF EXISTS "Users can view review logs for accessible transactions" ON public.transaction_review_log;
DROP POLICY IF EXISTS "Users can create review logs for accessible transactions" ON public.transaction_review_log;

CREATE POLICY "Users can view review logs for accessible transactions"
  ON public.transaction_review_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = transaction_id
      AND public.can_access_client(t.client_id)
    )
  );

CREATE POLICY "Users can create review logs for accessible transactions"
  ON public.transaction_review_log
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = transaction_id
      AND public.can_access_client(t.client_id)
    )
  );

-- RLS Policies for transaction_documents
DROP POLICY IF EXISTS "Users can view documents for accessible transactions" ON public.transaction_documents;
DROP POLICY IF EXISTS "Users can upload documents for accessible transactions" ON public.transaction_documents;

CREATE POLICY "Users can view documents for accessible transactions"
  ON public.transaction_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = transaction_id
      AND public.can_access_client(t.client_id)
    )
  );

CREATE POLICY "Users can upload documents for accessible transactions"
  ON public.transaction_documents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = transaction_id
      AND public.can_access_client(t.client_id)
    )
  );

-- Update existing transactions RLS policies
DROP POLICY IF EXISTS "Users can view their transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create their transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view accessible transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create transactions for accessible clients" ON public.transactions;
DROP POLICY IF EXISTS "Users can update transactions based on role and status" ON public.transactions;

-- New comprehensive RLS policies for transactions
CREATE POLICY "Users can view accessible transactions"
  ON public.transactions
  FOR SELECT
  USING (public.can_access_client(client_id));

CREATE POLICY "Users can create transactions for accessible clients"
  ON public.transactions
  FOR INSERT
  WITH CHECK (public.can_access_client(client_id));

CREATE POLICY "Users can update transactions based on role and status"
  ON public.transactions
  FOR UPDATE
  USING (
    public.can_access_client(client_id) AND
    CASE 
      -- Staff can only edit their own draft transactions
      WHEN (SELECT user_role FROM public.profiles WHERE id = auth.uid()) = 'staff' THEN
        created_by = auth.uid() AND status = 'draft'
      -- Seniors can edit transactions for their assigned clients
      WHEN (SELECT user_role FROM public.profiles WHERE id = auth.uid()) = 'senior_staff' THEN
        status IN ('draft', 'submitted')
      -- Partners can edit any transaction in their firm
      WHEN (SELECT user_role FROM public.profiles WHERE id = auth.uid()) = 'partner' THEN
        true
      ELSE false
    END
  );

-- Create storage bucket for transaction documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('transaction-documents', 'transaction-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for transaction documents
DROP POLICY IF EXISTS "Users can upload transaction documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view transaction documents" ON storage.objects;

CREATE POLICY "Users can upload transaction documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'transaction-documents');

CREATE POLICY "Users can view transaction documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'transaction-documents');
