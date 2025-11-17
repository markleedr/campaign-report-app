-- Add RLS policies for ad_proofs to allow users to INSERT, UPDATE, and DELETE
-- These policies allow full access since this is an internal agency tool

-- Allow anyone to insert ad proofs
CREATE POLICY "Users can insert ad proofs"
ON public.ad_proofs
FOR INSERT
TO public
WITH CHECK (true);

-- Allow anyone to update ad proofs
CREATE POLICY "Users can update ad proofs"
ON public.ad_proofs
FOR UPDATE
TO public
USING (true);

-- Allow anyone to delete ad proofs
CREATE POLICY "Users can delete ad proofs"
ON public.ad_proofs
FOR DELETE
TO public
USING (true);

-- Add RLS policies for ad_proof_versions to allow INSERT and UPDATE
CREATE POLICY "Users can insert ad proof versions"
ON public.ad_proof_versions
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can update ad proof versions"
ON public.ad_proof_versions
FOR UPDATE
TO public
USING (true);