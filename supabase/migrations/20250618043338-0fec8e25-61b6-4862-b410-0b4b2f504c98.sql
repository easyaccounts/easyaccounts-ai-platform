
-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('report', 'deliverable', 'transaction', 'comment', 'request')),
  entity_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'edit', 'finalise', 'share', 'comment', 'revoke', 'approve', 'submit_for_review')),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL,
  context TEXT DEFAULT 'firm',
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL,
  sender_id UUID,
  type TEXT NOT NULL CHECK (type IN ('new_report', 'comment', 'status_change', 'request_reply', 'report_shared', 'deliverable_update')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('report', 'deliverable', 'transaction', 'comment', 'request')),
  entity_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs
CREATE POLICY "Users can view audit logs for their firm/business"
  ON public.audit_logs
  FOR SELECT
  USING (
    -- Partners can see all audit logs in their firm
    (SELECT user_role FROM public.profiles WHERE id = auth.uid()) = 'partner'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = audit_logs.user_id 
      AND p.firm_id = (SELECT firm_id FROM public.profiles WHERE id = auth.uid())
    )
    OR
    -- Senior staff can see audit logs for their assigned clients
    (SELECT user_role FROM public.profiles WHERE id = auth.uid()) = 'senior_staff'
    AND (
      user_id = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = audit_logs.user_id 
        AND p.firm_id = (SELECT firm_id FROM public.profiles WHERE id = auth.uid())
      )
    )
    OR
    -- Staff can see their own audit logs
    (SELECT user_role FROM public.profiles WHERE id = auth.uid()) = 'staff'
    AND user_id = auth.uid()
    OR
    -- Business owners can see audit logs for their business
    (SELECT user_group FROM public.profiles WHERE id = auth.uid()) = 'business_owner'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = audit_logs.user_id 
      AND p.business_id = (SELECT business_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (recipient_id = auth.uid());

-- Function to create audit log
CREATE OR REPLACE FUNCTION public.create_audit_log(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_action TEXT,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_id UUID;
  user_profile RECORD;
BEGIN
  -- Get user profile info
  SELECT user_role, user_group INTO user_profile
  FROM public.profiles 
  WHERE id = auth.uid();

  -- Insert audit log
  INSERT INTO public.audit_logs (
    entity_type,
    entity_id,
    action,
    user_id,
    role,
    description,
    metadata
  ) VALUES (
    p_entity_type,
    p_entity_id,
    p_action,
    auth.uid(),
    user_profile.user_role,
    p_description,
    p_metadata
  ) RETURNING id INTO audit_id;

  RETURN audit_id;
END;
$$;

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_recipient_id UUID,
  p_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_title TEXT,
  p_message TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    recipient_id,
    sender_id,
    type,
    entity_type,
    entity_id,
    title,
    message
  ) VALUES (
    p_recipient_id,
    auth.uid(),
    p_type,
    p_entity_type,
    p_entity_id,
    p_title,
    p_message
  ) RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$;

-- Update reports table to add finalisation fields
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS finalised_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS finalised_by UUID,
ADD COLUMN IF NOT EXISTS shared_with_client_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS shared_by UUID;

-- Update deliverables table to add finalisation fields
ALTER TABLE public.deliverables 
ADD COLUMN IF NOT EXISTS finalised_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS finalised_by UUID,
ADD COLUMN IF NOT EXISTS shared_with_client_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS shared_by UUID;
