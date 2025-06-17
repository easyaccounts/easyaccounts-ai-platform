
-- First, let's add some missing columns to the existing clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS gstin VARCHAR(15),
ADD COLUMN IF NOT EXISTS monthly_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20) DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS business_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS industry VARCHAR(100),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Update deliverables table with additional fields
ALTER TABLE public.deliverables 
ADD COLUMN IF NOT EXISTS deliverable_type VARCHAR(50) DEFAULT 'custom',
ADD COLUMN IF NOT EXISTS frequency VARCHAR(20) DEFAULT 'one-time',
ADD COLUMN IF NOT EXISTS input_checklist JSONB,
ADD COLUMN IF NOT EXISTS file_urls TEXT[];

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    firm_id UUID REFERENCES public.firms(id),
    business_id UUID REFERENCES public.businesses(id),
    report_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    period_start DATE,
    period_end DATE,
    file_url TEXT,
    report_data JSONB,
    status VARCHAR(20) DEFAULT 'draft',
    approved_by UUID,
    version INTEGER DEFAULT 1,
    notes TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create request_messages table for threaded conversations
CREATE TABLE IF NOT EXISTS public.request_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    message_text TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add missing columns to requests table
ALTER TABLE public.requests 
ADD COLUMN IF NOT EXISTS request_type VARCHAR(50) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS assigned_to UUID;

-- Enable RLS on new tables
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports table
CREATE POLICY "Users can view reports from their firm/business" ON public.reports
FOR SELECT USING (
    CASE 
        WHEN get_current_user_group() = 'accounting_firm' THEN firm_id = get_current_user_firm_id()
        WHEN get_current_user_group() = 'business_owner' THEN business_id = get_current_user_business_id()
        ELSE false
    END
);

CREATE POLICY "Accounting firm users can manage reports" ON public.reports
FOR ALL USING (
    get_current_user_group() = 'accounting_firm' AND 
    firm_id = get_current_user_firm_id()
);

CREATE POLICY "Business users can view approved reports" ON public.reports
FOR SELECT USING (
    get_current_user_group() = 'business_owner' AND 
    business_id = get_current_user_business_id() AND
    status = 'approved'
);

-- RLS Policies for request_messages table
CREATE POLICY "Users can view messages from their firm/business" ON public.request_messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.requests r 
        WHERE r.id = request_id AND (
            CASE 
                WHEN get_current_user_group() = 'accounting_firm' THEN r.firm_id = get_current_user_firm_id()
                WHEN get_current_user_group() = 'business_owner' THEN r.business_id = get_current_user_business_id()
                ELSE false
            END
        )
    )
);

CREATE POLICY "Users can create messages in their scope" ON public.request_messages
FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.requests r 
        WHERE r.id = request_id AND (
            CASE 
                WHEN get_current_user_group() = 'accounting_firm' THEN r.firm_id = get_current_user_firm_id()
                WHEN get_current_user_group() = 'business_owner' THEN r.business_id = get_current_user_business_id()
                ELSE false
            END
        )
    )
);

-- RLS Policies for clients table (if not already present)
DROP POLICY IF EXISTS "Users can view clients from their firm/business" ON public.clients;
CREATE POLICY "Users can view clients from their firm/business" ON public.clients
FOR SELECT USING (
    CASE 
        WHEN get_current_user_group() = 'accounting_firm' THEN firm_id = get_current_user_firm_id()
        WHEN get_current_user_group() = 'business_owner' THEN business_id = get_current_user_business_id()
        ELSE false
    END
);

CREATE POLICY "Partners can manage clients" ON public.clients
FOR ALL USING (
    get_current_user_group() = 'accounting_firm' AND 
    get_current_user_role() = 'partner' AND
    firm_id = get_current_user_firm_id()
);

-- RLS Policies for deliverables table
DROP POLICY IF EXISTS "Users can view deliverables from their firm/business" ON public.deliverables;
CREATE POLICY "Users can view deliverables from their firm/business" ON public.deliverables
FOR SELECT USING (
    CASE 
        WHEN get_current_user_group() = 'accounting_firm' THEN firm_id = get_current_user_firm_id()
        WHEN get_current_user_group() = 'business_owner' THEN business_id = get_current_user_business_id()
        ELSE false
    END
);

CREATE POLICY "Accounting firm users can manage deliverables" ON public.deliverables
FOR ALL USING (
    get_current_user_group() = 'accounting_firm' AND 
    firm_id = get_current_user_firm_id() AND
    get_current_user_role() IN ('partner', 'senior_staff')
);

-- RLS Policies for requests table
DROP POLICY IF EXISTS "Users can view requests from their firm/business" ON public.requests;
CREATE POLICY "Users can view requests from their firm/business" ON public.requests
FOR SELECT USING (
    CASE 
        WHEN get_current_user_group() = 'accounting_firm' THEN firm_id = get_current_user_firm_id()
        WHEN get_current_user_group() = 'business_owner' THEN business_id = get_current_user_business_id()
        ELSE false
    END
);

CREATE POLICY "Clients can create requests" ON public.requests
FOR INSERT WITH CHECK (
    get_current_user_group() = 'business_owner' AND 
    business_id = get_current_user_business_id() AND
    created_by = auth.uid()
);

CREATE POLICY "Accounting firm users can manage requests" ON public.requests
FOR ALL USING (
    get_current_user_group() = 'accounting_firm' AND 
    firm_id = get_current_user_firm_id()
);
