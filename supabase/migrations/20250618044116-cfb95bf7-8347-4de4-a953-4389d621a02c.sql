
-- Add foreign key constraints to link audit_logs and notifications to profiles
-- First, add foreign key constraints for the user relationships
ALTER TABLE public.audit_logs 
ADD CONSTRAINT fk_audit_logs_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE public.notifications 
ADD CONSTRAINT fk_notifications_recipient_id 
FOREIGN KEY (recipient_id) REFERENCES auth.users(id);

ALTER TABLE public.notifications 
ADD CONSTRAINT fk_notifications_sender_id 
FOREIGN KEY (sender_id) REFERENCES auth.users(id);
