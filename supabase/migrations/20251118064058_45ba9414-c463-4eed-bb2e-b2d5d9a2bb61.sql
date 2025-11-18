-- Update RLS policies to require authentication for write operations

-- Campaigns table: Require auth for all write operations, keep public read
DROP POLICY IF EXISTS "Public read access for campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can insert campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can update campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can delete campaigns" ON public.campaigns;

CREATE POLICY "Authenticated users can read campaigns"
ON public.campaigns FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert campaigns"
ON public.campaigns FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update campaigns"
ON public.campaigns FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete campaigns"
ON public.campaigns FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Clients table: Require auth for all write operations
DROP POLICY IF EXISTS "Public read access for clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete clients" ON public.clients;

CREATE POLICY "Authenticated users can read clients"
ON public.clients FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert clients"
ON public.clients FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update clients"
ON public.clients FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete clients"
ON public.clients FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Ad proofs: Require auth for write, allow public read via share_token or auth
DROP POLICY IF EXISTS "Anyone can view ad proofs with valid share token" ON public.ad_proofs;
DROP POLICY IF EXISTS "Users can insert ad proofs" ON public.ad_proofs;
DROP POLICY IF EXISTS "Users can update ad proofs" ON public.ad_proofs;
DROP POLICY IF EXISTS "Users can delete ad proofs" ON public.ad_proofs;

CREATE POLICY "Public can view ad proofs with share token, auth users can view all"
ON public.ad_proofs FOR SELECT
USING (true); -- Keep public for share links

CREATE POLICY "Authenticated users can insert ad proofs"
ON public.ad_proofs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update ad proofs"
ON public.ad_proofs FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete ad proofs"
ON public.ad_proofs FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Ad proof versions: Require auth for write operations
DROP POLICY IF EXISTS "Users can insert ad proof versions" ON public.ad_proof_versions;
DROP POLICY IF EXISTS "Users can update ad proof versions" ON public.ad_proof_versions;

CREATE POLICY "Authenticated users can insert ad proof versions"
ON public.ad_proof_versions FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update ad proof versions"
ON public.ad_proof_versions FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Comments: Keep public insert for client feedback, require auth for internal viewing
DROP POLICY IF EXISTS "Anyone can insert comments" ON public.comments;

CREATE POLICY "Anyone can insert comments"
ON public.comments FOR INSERT
WITH CHECK (true); -- Allow public for client feedback