-- Combined migrations for AdProof database setup
-- Run this entire file in Supabase SQL Editor

-- Migration 1: Create base tables
-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ad_proofs table
CREATE TABLE IF NOT EXISTS public.ad_proofs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  ad_format TEXT NOT NULL,
  share_token TEXT NOT NULL UNIQUE,
  current_version INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ad_proof_versions table
CREATE TABLE IF NOT EXISTS public.ad_proof_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_proof_id UUID NOT NULL REFERENCES public.ad_proofs(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  ad_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ad_proof_id, version_number)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_proof_id UUID NOT NULL REFERENCES public.ad_proofs(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  comment_type TEXT NOT NULL,
  field_name TEXT,
  comment_text TEXT NOT NULL,
  commenter_name TEXT NOT NULL,
  commenter_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create approvals table
CREATE TABLE IF NOT EXISTS public.approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_proof_id UUID NOT NULL REFERENCES public.ad_proofs(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  decision TEXT NOT NULL,
  comment TEXT NOT NULL,
  approver_name TEXT NOT NULL,
  approver_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_proof_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for ad media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ad-media', 'ad-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for ad media
DO $$ BEGIN
  CREATE POLICY "Anyone can view ad media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ad-media');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can upload ad media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'ad-media');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can update ad media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'ad-media');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_client_id ON public.campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_ad_proofs_campaign_id ON public.ad_proofs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_proofs_share_token ON public.ad_proofs(share_token);
CREATE INDEX IF NOT EXISTS idx_ad_proof_versions_ad_proof_id ON public.ad_proof_versions(ad_proof_id);
CREATE INDEX IF NOT EXISTS idx_comments_ad_proof_id ON public.comments(ad_proof_id);
CREATE INDEX IF NOT EXISTS idx_approvals_ad_proof_id ON public.approvals(ad_proof_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_ad_proofs_updated_at ON public.ad_proofs;
CREATE TRIGGER update_ad_proofs_updated_at
BEFORE UPDATE ON public.ad_proofs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migration 2: Add additional columns
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS platform text,
ADD COLUMN IF NOT EXISTS share_token text UNIQUE;

ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS logo_url text;

ALTER TABLE public.ad_proofs
ADD COLUMN IF NOT EXISTS name TEXT;

CREATE INDEX IF NOT EXISTS idx_campaigns_share_token ON public.campaigns(share_token);

-- Migration 3: Create share token generation function
CREATE OR REPLACE FUNCTION public.generate_campaign_share_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_token text;
  token_exists boolean;
BEGIN
  LOOP
    new_token := encode(gen_random_bytes(9), 'base64');
    new_token := replace(new_token, '/', '_');
    new_token := replace(new_token, '+', '-');
    new_token := substring(new_token, 1, 12);
    
    SELECT EXISTS(SELECT 1 FROM public.campaigns WHERE share_token = new_token) INTO token_exists;
    
    EXIT WHEN NOT token_exists;
  END LOOP;
  
  RETURN new_token;
END;
$$;

-- Migration 4: RLS Policies for authenticated users
-- Clients policies
DROP POLICY IF EXISTS "Public read access for clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can read clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can update clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can delete clients" ON public.clients;
DROP POLICY IF EXISTS "Anyone can read clients" ON public.clients;

CREATE POLICY "Anyone can read clients"
ON public.clients FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert clients"
ON public.clients FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update clients"
ON public.clients FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete clients"
ON public.clients FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Campaigns policies
DROP POLICY IF EXISTS "Public read access for campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can insert campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can update campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can delete campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can read campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can insert campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can update campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can delete campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Anyone can read campaigns" ON public.campaigns;

CREATE POLICY "Anyone can read campaigns"
ON public.campaigns FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert campaigns"
ON public.campaigns FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update campaigns"
ON public.campaigns FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete campaigns"
ON public.campaigns FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Ad proofs policies
DROP POLICY IF EXISTS "Anyone can view ad proofs with valid share token" ON public.ad_proofs;
DROP POLICY IF EXISTS "Users can insert ad proofs" ON public.ad_proofs;
DROP POLICY IF EXISTS "Users can update ad proofs" ON public.ad_proofs;
DROP POLICY IF EXISTS "Users can delete ad proofs" ON public.ad_proofs;
DROP POLICY IF EXISTS "Public can view ad proofs with share token, auth users can view all" ON public.ad_proofs;
DROP POLICY IF EXISTS "Authenticated users can insert ad proofs" ON public.ad_proofs;
DROP POLICY IF EXISTS "Authenticated users can update ad proofs" ON public.ad_proofs;
DROP POLICY IF EXISTS "Authenticated users can delete ad proofs" ON public.ad_proofs;

CREATE POLICY "Anyone can view ad proofs"
ON public.ad_proofs FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert ad proofs"
ON public.ad_proofs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update ad proofs"
ON public.ad_proofs FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete ad proofs"
ON public.ad_proofs FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Ad proof versions policies
DROP POLICY IF EXISTS "Anyone can view ad proof versions" ON public.ad_proof_versions;
DROP POLICY IF EXISTS "Users can insert ad proof versions" ON public.ad_proof_versions;
DROP POLICY IF EXISTS "Users can update ad proof versions" ON public.ad_proof_versions;
DROP POLICY IF EXISTS "Authenticated users can insert ad proof versions" ON public.ad_proof_versions;
DROP POLICY IF EXISTS "Authenticated users can update ad proof versions" ON public.ad_proof_versions;

CREATE POLICY "Anyone can view ad proof versions"
ON public.ad_proof_versions FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert ad proof versions"
ON public.ad_proof_versions FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update ad proof versions"
ON public.ad_proof_versions FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Comments policies (allow public insert for client feedback)
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can insert comments" ON public.comments;

CREATE POLICY "Anyone can view comments"
ON public.comments FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert comments"
ON public.comments FOR INSERT
WITH CHECK (true);

-- Approvals policies
DROP POLICY IF EXISTS "Anyone can view approvals" ON public.approvals;
DROP POLICY IF EXISTS "Anyone can insert approvals" ON public.approvals;
DROP POLICY IF EXISTS "Authenticated users can view approvals" ON public.approvals;

CREATE POLICY "Anyone can view approvals"
ON public.approvals FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert approvals"
ON public.approvals FOR INSERT
WITH CHECK (true);
