-- ==========================================
-- CREATE STORAGE BUCKET FOR PROOFS
-- ==========================================

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('proofs', 'proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for the 'proofs' bucket
-- 1. Allow anyone to view proofs (public bucket)
DROP POLICY IF EXISTS "Anyone can view proofs" ON storage.objects;
CREATE POLICY "Anyone can view proofs"
  ON storage.objects FOR SELECT USING (bucket_id = 'proofs');

-- 2. Allow authenticated users to upload proofs
DROP POLICY IF EXISTS "Authenticated users can upload proofs" ON storage.objects;
CREATE POLICY "Authenticated users can upload proofs"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'proofs' AND auth.role() = 'authenticated'
  );

-- 3. Allow users to update/delete their own proofs
DROP POLICY IF EXISTS "Users can manage their own proofs" ON storage.objects;
CREATE POLICY "Users can manage their own proofs"
  ON storage.objects FOR ALL USING (
    bucket_id = 'proofs' AND (auth.uid())::text = (storage.foldername(name))[1]
  );
