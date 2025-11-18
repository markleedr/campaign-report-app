-- Drop the existing public select policy
DROP POLICY IF EXISTS "Anyone can view approvals" ON public.approvals;

-- Create a security definer function to get approvals for a specific share token
CREATE OR REPLACE FUNCTION public.get_approvals_by_share_token(p_share_token text)
RETURNS SETOF public.approvals
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.*
  FROM public.approvals a
  INNER JOIN public.ad_proofs ap ON a.ad_proof_id = ap.id
  WHERE ap.share_token = p_share_token;
$$;

-- Create a new SELECT policy that requires authentication
-- This prevents anonymous bulk scraping of emails
CREATE POLICY "Authenticated users can view approvals"
ON public.approvals
FOR SELECT
USING (auth.uid() IS NOT NULL);