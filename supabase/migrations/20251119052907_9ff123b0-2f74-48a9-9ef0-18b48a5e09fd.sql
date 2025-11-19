-- Allow public read access to campaigns table for shared ad proofs
DROP POLICY IF EXISTS "Authenticated users can read campaigns" ON campaigns;
CREATE POLICY "Anyone can read campaigns"
  ON campaigns FOR SELECT
  USING (true);

-- Allow public read access to clients table for shared ad proofs  
DROP POLICY IF EXISTS "Authenticated users can read clients" ON clients;
CREATE POLICY "Anyone can read clients"
  ON clients FOR SELECT
  USING (true);

-- Allow public read access to approvals table for shared ad proofs
DROP POLICY IF EXISTS "Authenticated users can view approvals" ON approvals;
CREATE POLICY "Anyone can view approvals"
  ON approvals FOR SELECT
  USING (true);