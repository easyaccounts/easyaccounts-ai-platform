
-- Create storage bucket for firm-specific assets like logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('firm-assets', 'firm-assets', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for firm-assets bucket
-- Allow public read access for logos
CREATE POLICY "Firm assets are publicly viewable"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'firm-assets');

-- Allow authenticated firm members to insert assets in their firm's folder
CREATE POLICY "Firm members can insert their own firm assets"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'firm-assets' AND
    (storage.foldername(name))[1] = (SELECT firm_id::text FROM public.profiles WHERE id = auth.uid())
  );

-- Allow authenticated firm members to update assets in their firm's folder
CREATE POLICY "Firm members can update their own firm assets"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'firm-assets' AND
    (storage.foldername(name))[1] = (SELECT firm_id::text FROM public.profiles WHERE id = auth.uid())
  );

-- Allow authenticated firm members to delete assets in their firm's folder
CREATE POLICY "Firm members can delete their own firm assets"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'firm-assets' AND
    (storage.foldername(name))[1] = (SELECT firm_id::text FROM public.profiles WHERE id = auth.uid())
  );
