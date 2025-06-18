
-- Drop the obsolete user_assignments table
DROP TABLE IF EXISTS public.user_assignments;

-- Function to handle new user creation and profile setup with organization creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  new_firm_id UUID;
  new_business_id UUID;
  user_group_text TEXT;
BEGIN
  -- Extract user_group from metadata
  user_group_text := NEW.raw_user_meta_data ->> 'user_group';

  -- Create a new firm or business based on the user_group
  IF user_group_text = 'accounting_firm' THEN
    INSERT INTO public.firms (name)
    VALUES (NEW.raw_user_meta_data ->> 'firm_name')
    RETURNING id INTO new_firm_id;
  ELSIF user_group_text = 'business_owner' THEN
    INSERT INTO public.businesses (name)
    VALUES (NEW.raw_user_meta_data ->> 'business_name')
    RETURNING id INTO new_business_id;
  END IF;

  -- Insert the new profile, linking it to the newly created firm or business
  INSERT INTO public.profiles (id, email, first_name, last_name, user_group, user_role, firm_id, business_id, firm_name, business_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    (NEW.raw_user_meta_data ->> 'user_group')::public.user_group,
    (NEW.raw_user_meta_data ->> 'user_role')::public.user_role,
    new_firm_id,
    new_business_id,
    NEW.raw_user_meta_data ->> 'firm_name',
    NEW.raw_user_meta_data ->> 'business_name'
  );
  RETURN NEW;
END;
$$;

-- Trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
