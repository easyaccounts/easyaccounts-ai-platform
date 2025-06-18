
-- Create dashboard statistics functions for all user roles

-- Function for Senior Staff dashboard stats
CREATE OR REPLACE FUNCTION public.get_senior_dashboard_stats(p_user_id UUID, p_firm_id UUID)
RETURNS JSON
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  assigned_clients INTEGER;
  completed_work INTEGER;
  pending_reviews INTEGER;
  revenue_impact NUMERIC;
BEGIN
  -- Get assigned clients count
  SELECT COUNT(DISTINCT tca.client_id) INTO assigned_clients
  FROM public.team_client_assignments tca
  WHERE tca.team_member_id = p_user_id;

  -- Get completed work count (deliverables completed this month)
  SELECT COUNT(*) INTO completed_work
  FROM public.deliverables d
  JOIN public.team_client_assignments tca ON d.client_id = tca.client_id
  WHERE tca.team_member_id = p_user_id
  AND d.status = 'completed'
  AND d.updated_at >= DATE_TRUNC('month', CURRENT_DATE);

  -- Get pending reviews count
  SELECT COUNT(*) INTO pending_reviews
  FROM public.deliverables d
  JOIN public.team_client_assignments tca ON d.client_id = tca.client_id
  WHERE tca.team_member_id = p_user_id
  AND d.status IN ('in_review', 'under_review');

  -- Get revenue impact (sum of monthly fees for assigned clients)
  SELECT COALESCE(SUM(c.monthly_fee), 0) INTO revenue_impact
  FROM public.clients c
  JOIN public.team_client_assignments tca ON c.id = tca.client_id
  WHERE tca.team_member_id = p_user_id;

  -- Build final result
  result := JSON_BUILD_OBJECT(
    'assignedClients', assigned_clients,
    'completedWork', completed_work,
    'pendingReviews', pending_reviews,
    'revenueImpact', revenue_impact
  );

  RETURN result;
END;
$$;

-- Function for Staff dashboard stats
CREATE OR REPLACE FUNCTION public.get_staff_dashboard_stats(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  pending_tasks INTEGER;
  completed_tasks INTEGER;
  documents_to_review INTEGER;
  active_clients INTEGER;
BEGIN
  -- Get pending tasks count
  SELECT COUNT(*) INTO pending_tasks
  FROM public.deliverable_tasks dt
  JOIN public.task_assignments ta ON dt.id = ta.task_id
  WHERE ta.assigned_to = p_user_id
  AND dt.status = 'pending';

  -- Get completed tasks count (this month)
  SELECT COUNT(*) INTO completed_tasks
  FROM public.deliverable_tasks dt
  JOIN public.task_assignments ta ON dt.id = ta.task_id
  WHERE ta.assigned_to = p_user_id
  AND dt.status = 'completed'
  AND dt.updated_at >= DATE_TRUNC('month', CURRENT_DATE);

  -- Get documents to review count
  SELECT COUNT(*) INTO documents_to_review
  FROM public.transactions t
  WHERE t.status = 'draft'
  AND t.created_at >= DATE_TRUNC('month', CURRENT_DATE);

  -- Get active clients count (assigned to user)
  SELECT COUNT(DISTINCT tca.client_id) INTO active_clients
  FROM public.team_client_assignments tca
  WHERE tca.team_member_id = p_user_id;

  -- Build final result
  result := JSON_BUILD_OBJECT(
    'pendingTasks', pending_tasks,
    'completedTasks', completed_tasks,
    'documentsToReview', documents_to_review,
    'activeClients', active_clients
  );

  RETURN result;
END;
$$;

-- Function for Client dashboard stats
CREATE OR REPLACE FUNCTION public.get_client_dashboard_stats(p_client_id UUID)
RETURNS JSON
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  deliverables_pending INTEGER;
  uploads_completed INTEGER;
  tasks_in_progress INTEGER;
  open_requests INTEGER;
BEGIN
  -- Get deliverables pending count
  SELECT COUNT(*) INTO deliverables_pending
  FROM public.deliverables
  WHERE client_id = p_client_id
  AND status = 'pending';

  -- Get uploads completed count (this month)
  SELECT COUNT(*) INTO uploads_completed
  FROM public.transactions
  WHERE client_id = p_client_id
  AND created_at >= DATE_TRUNC('month', CURRENT_DATE);

  -- Get tasks in progress count
  SELECT COUNT(*) INTO tasks_in_progress
  FROM public.deliverables d
  JOIN public.deliverable_tasks dt ON d.id = dt.deliverable_id
  WHERE d.client_id = p_client_id
  AND dt.status = 'in_progress';

  -- Get open requests count
  SELECT COUNT(*) INTO open_requests
  FROM public.requests
  WHERE client_id = p_client_id
  AND status = 'open';

  -- Build final result
  result := JSON_BUILD_OBJECT(
    'deliverablesPending', deliverables_pending,
    'uploadsCompleted', uploads_completed,
    'tasksInProgress', tasks_in_progress,
    'openRequests', open_requests
  );

  RETURN result;
END;
$$;
