
-- Create enum types for user roles and groups
CREATE TYPE public.user_group AS ENUM ('accounting_firm', 'business_owner');
CREATE TYPE public.user_role AS ENUM ('partner', 'senior_staff', 'staff', 'client', 'management', 'accounting_team');

-- Create firms table
CREATE TABLE public.firms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  registration_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create businesses table
CREATE TABLE public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  registration_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  user_group public.user_group NOT NULL,
  user_role public.user_role NOT NULL,
  firm_name TEXT,
  business_name TEXT,
  firm_id UUID REFERENCES public.firms(id),
  business_id UUID REFERENCES public.businesses(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create security definer function to get user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.user_role AS $$
  SELECT user_role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create security definer function to get user group (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_group()
RETURNS public.user_group AS $$
  SELECT user_group FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create security definer function to get user firm_id (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_firm_id()
RETURNS UUID AS $$
  SELECT firm_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create security definer function to get user business_id (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_business_id()
RETURNS UUID AS $$
  SELECT business_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  pan_number TEXT,
  gst_number TEXT,
  firm_id UUID REFERENCES public.firms(id),
  business_id UUID REFERENCES public.businesses(id),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id) NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  notes TEXT,
  firm_id UUID REFERENCES public.firms(id),
  business_id UUID REFERENCES public.businesses(id),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoice_items table
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  transaction_date DATE NOT NULL,
  category TEXT,
  reference_number TEXT,
  client_id UUID REFERENCES public.clients(id),
  firm_id UUID REFERENCES public.firms(id),
  business_id UUID REFERENCES public.businesses(id),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  expense_date DATE NOT NULL,
  category TEXT,
  receipt_url TEXT,
  firm_id UUID REFERENCES public.firms(id),
  business_id UUID REFERENCES public.businesses(id),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deliverables table
CREATE TABLE public.deliverables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES public.clients(id) NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  firm_id UUID REFERENCES public.firms(id),
  business_id UUID REFERENCES public.businesses(id),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create requests table
CREATE TABLE public.requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES public.clients(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  firm_id UUID REFERENCES public.firms(id),
  business_id UUID REFERENCES public.businesses(id),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create accounts table (Chart of Accounts)
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  parent_account_id UUID REFERENCES public.accounts(id),
  balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  firm_id UUID REFERENCES public.firms(id),
  business_id UUID REFERENCES public.businesses(id),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for firms table
CREATE POLICY "Firm members can view their firm" ON public.firms
  FOR SELECT USING (id = public.get_current_user_firm_id());

CREATE POLICY "Partners can update firm details" ON public.firms
  FOR UPDATE USING (id = public.get_current_user_firm_id() AND public.get_current_user_role() = 'partner');

-- RLS Policies for businesses table
CREATE POLICY "Business members can view their business" ON public.businesses
  FOR SELECT USING (id = public.get_current_user_business_id());

CREATE POLICY "Management can update business details" ON public.businesses
  FOR UPDATE USING (id = public.get_current_user_business_id() AND public.get_current_user_role() = 'management');

-- RLS Policies for clients table
CREATE POLICY "Firm members can view firm clients" ON public.clients
  FOR SELECT USING (firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id());

CREATE POLICY "Firm members can create clients" ON public.clients
  FOR INSERT WITH CHECK (firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id());

CREATE POLICY "Firm members can update clients" ON public.clients
  FOR UPDATE USING (firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id());

CREATE POLICY "Partners and management can delete clients" ON public.clients
  FOR DELETE USING ((firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id()) 
    AND public.get_current_user_role() IN ('partner', 'management'));

-- RLS Policies for invoices table
CREATE POLICY "Organization members can view invoices" ON public.invoices
  FOR SELECT USING (firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id());

CREATE POLICY "Organization members can create invoices" ON public.invoices
  FOR INSERT WITH CHECK (firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id());

CREATE POLICY "Organization members can update invoices" ON public.invoices
  FOR UPDATE USING (firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id());

CREATE POLICY "Partners and management can delete invoices" ON public.invoices
  FOR DELETE USING ((firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id()) 
    AND public.get_current_user_role() IN ('partner', 'management'));

-- RLS Policies for invoice_items table
CREATE POLICY "Users can view invoice items through invoices" ON public.invoice_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND (invoices.firm_id = public.get_current_user_firm_id() OR invoices.business_id = public.get_current_user_business_id())
    )
  );

CREATE POLICY "Users can manage invoice items" ON public.invoice_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND (invoices.firm_id = public.get_current_user_firm_id() OR invoices.business_id = public.get_current_user_business_id())
    )
  );

-- RLS Policies for transactions table
CREATE POLICY "Organization members can view transactions" ON public.transactions
  FOR SELECT USING (firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id());

CREATE POLICY "Organization members can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id());

CREATE POLICY "Organization members can update transactions" ON public.transactions
  FOR UPDATE USING (firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id());

CREATE POLICY "Partners and management can delete transactions" ON public.transactions
  FOR DELETE USING ((firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id()) 
    AND public.get_current_user_role() IN ('partner', 'management'));

-- RLS Policies for expenses table
CREATE POLICY "Organization members can view expenses" ON public.expenses
  FOR SELECT USING (firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id());

CREATE POLICY "Organization members can create expenses" ON public.expenses
  FOR INSERT WITH CHECK (firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id());

CREATE POLICY "Organization members can update expenses" ON public.expenses
  FOR UPDATE USING (firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id());

CREATE POLICY "Partners and management can delete expenses" ON public.expenses
  FOR DELETE USING ((firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id()) 
    AND public.get_current_user_role() IN ('partner', 'management'));

-- RLS Policies for deliverables table
CREATE POLICY "Organization members can view deliverables" ON public.deliverables
  FOR SELECT USING (firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id());

CREATE POLICY "Organization members can create deliverables" ON public.deliverables
  FOR INSERT WITH CHECK (firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id());

CREATE POLICY "Organization members can update deliverables" ON public.deliverables
  FOR UPDATE USING (firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id());

CREATE POLICY "Partners and management can delete deliverables" ON public.deliverables
  FOR DELETE USING ((firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id()) 
    AND public.get_current_user_role() IN ('partner', 'management'));

-- RLS Policies for requests table
CREATE POLICY "Organization members can view requests" ON public.requests
  FOR SELECT USING (firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id());

CREATE POLICY "Organization members can create requests" ON public.requests
  FOR INSERT WITH CHECK (firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id());

CREATE POLICY "Organization members can update requests" ON public.requests
  FOR UPDATE USING (firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id());

CREATE POLICY "Partners and management can delete requests" ON public.requests
  FOR DELETE USING ((firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id()) 
    AND public.get_current_user_role() IN ('partner', 'management'));

-- RLS Policies for accounts table
CREATE POLICY "Organization members can view accounts" ON public.accounts
  FOR SELECT USING (firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id());

CREATE POLICY "Organization members can create accounts" ON public.accounts
  FOR INSERT WITH CHECK (firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id());

CREATE POLICY "Organization members can update accounts" ON public.accounts
  FOR UPDATE USING (firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id());

CREATE POLICY "Partners and management can delete accounts" ON public.accounts
  FOR DELETE USING ((firm_id = public.get_current_user_firm_id() OR business_id = public.get_current_user_business_id()) 
    AND public.get_current_user_role() IN ('partner', 'management'));

-- Function to handle new user creation and profile setup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, user_group, user_role, firm_name, business_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    (NEW.raw_user_meta_data ->> 'user_group')::public.user_group,
    (NEW.raw_user_meta_data ->> 'user_role')::public.user_role,
    NEW.raw_user_meta_data ->> 'firm_name',
    NEW.raw_user_meta_data ->> 'business_name'
  );
  RETURN NEW;
END;
$$;

-- Trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Add some initial seed data for testing
INSERT INTO public.firms (id, name, email, phone, address, city, state, postal_code, country) VALUES
  ('123e4567-e89b-12d3-a456-426614174000', 'Smith & Associates CA', 'contact@smithca.com', '+1-555-0123', '123 Business St', 'Mumbai', 'Maharashtra', '400001', 'India'),
  ('223e4567-e89b-12d3-a456-426614174001', 'Global Accounting Solutions', 'info@globalaccounting.com', '+1-555-0124', '456 Finance Ave', 'Delhi', 'Delhi', '110001', 'India');

INSERT INTO public.businesses (id, name, email, phone, address, city, state, postal_code, country) VALUES
  ('323e4567-e89b-12d3-a456-426614174002', 'TechStart Solutions Pvt Ltd', 'admin@techstart.com', '+1-555-0125', '789 Tech Park', 'Bangalore', 'Karnataka', '560001', 'India'),
  ('423e4567-e89b-12d3-a456-426614174003', 'Retail Plus India', 'accounts@retailplus.com', '+1-555-0126', '321 Commerce St', 'Pune', 'Maharashtra', '411001', 'India');
