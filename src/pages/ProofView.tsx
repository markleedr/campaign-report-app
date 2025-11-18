import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThumbsUp, MessageSquare, Loader2 } from "lucide-react";
import { FacebookSingleImagePreview } from "@/components/ad-previews/FacebookSingleImagePreview";
import { FacebookStoryPreview } from "@/components/ad-previews/FacebookStoryPreview";
import { FacebookCarouselPreview } from "@/components/ad-previews/FacebookCarouselPreview";
import { InstagramSingleImagePreview } from "@/components/ad-previews/InstagramSingleImagePreview";
import { InstagramStoryPreview } from "@/components/ad-previews/InstagramStoryPreview";
import { InstagramCarouselPreview } from "@/components/ad-previews/InstagramCarouselPreview";
import { LinkedInSingleImagePreview } from "@/components/ad-previews/LinkedInSingleImagePreview";
import { LinkedInCarouselPreview } from "@/components/ad-previews/LinkedInCarouselPreview";

const ProofView = () => {
  const { shareToken } = useParams();

  const { data: adProofData, isLoading } = useQuery({
    queryKey: ["adProof", shareToken],
    queryFn: async () => {
      const { data: adProof, error: proofError } = await supabase
        .from("ad_proofs")
        .select("*, campaigns(name, client_id, clients(name, logo_url))")
        .eq("share_token", shareToken)
        .single();

      if (proofError) throw proofError;

      const { data: version, error: versionError } = await supabase
        .from("ad_proof_versions")
        .select("*")
        .eq("ad_proof_id", adProof.id)
        .eq("version_number", adProof.current_version)
        .single();

      if (versionError) throw versionError;

      return { adProof, version };
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!adProofData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Ad Proof Not Found</h2>
          <p className="text-muted-foreground">This share link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const { adProof, version } = adProofData;
  const adData = version.ad_data as any;
  const campaign = adProof.campaigns as any;
  const client = campaign?.clients;

  const renderPreview = () => {
    const platform = adProof.platform;
    const format = adProof.ad_format;

    if (platform === "facebook") {
      if (format === "single_image" || format === "single-image") {
        return <FacebookSingleImagePreview 
          primaryText={adData.primaryText}
          imageUrl={adData.imageUrl}
          headline={adData.headline}
          description={adData.description}
          linkUrl={adData.linkUrl}
          callToAction={adData.callToAction}
          clientName={client?.name}
          clientLogoUrl={client?.logo_url}
        />;
      } else if (format === "story") {
        return <FacebookStoryPreview 
          imageUrl={adData.imageUrl}
          callToAction={adData.callToAction}
          clientName={client?.name}
          clientLogoUrl={client?.logo_url}
        />;
      } else if (format === "carousel") {
        return <FacebookCarouselPreview 
          primaryText={adData.primaryText}
          cards={adData.cards}
          clientName={client?.name}
          clientLogoUrl={client?.logo_url}
        />;
      }
    } else if (platform === "instagram") {
      if (format === "single_image" || format === "single-image") {
        return <InstagramSingleImagePreview 
          primaryText={adData.primaryText}
          imageUrl={adData.imageUrl}
          headline={adData.headline}
          description={adData.description}
          callToAction={adData.callToAction}
          clientName={client?.name}
          clientLogoUrl={client?.logo_url}
        />;
      } else if (format === "story") {
        return <InstagramStoryPreview 
          imageUrl={adData.imageUrl}
          callToAction={adData.callToAction}
          clientName={client?.name}
          clientLogoUrl={client?.logo_url}
        />;
      } else if (format === "carousel") {
        return <InstagramCarouselPreview 
          primaryText={adData.primaryText}
          cards={adData.cards}
          clientName={client?.name}
          clientLogoUrl={client?.logo_url}
        />;
      }
    } else if (platform === "linkedin") {
      if (format === "single_image" || format === "single-image") {
        return <LinkedInSingleImagePreview 
          primaryText={adData.primaryText}
          imageUrl={adData.imageUrl}
          headline={adData.headline}
          description={adData.description}
          linkUrl={adData.linkUrl}
          callToAction={adData.callToAction}
          clientName={client?.name}
          clientLogoUrl={client?.logo_url}
        />;
      } else if (format === "carousel") {
        return <LinkedInCarouselPreview 
          primaryText={adData.primaryText}
          cards={adData.cards}
          clientName={client?.name}
          clientLogoUrl={client?.logo_url}
        />;
      }
    }

    return <div className="text-muted-foreground">Preview not available for this ad type</div>;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background">
        <div className="mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-foreground">Ad Proof Manager</h1>
          <p className="text-sm text-muted-foreground">Ad Proof Review</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{client?.name} - {campaign?.name}</h2>
          <p className="text-sm text-muted-foreground">Version {adProof.current_version}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Ad Preview */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Ad Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex min-h-[400px] items-center justify-center">
                  {renderPreview()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Approval Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name *</Label>
                  <Input id="name" placeholder="Enter your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment">Comment *</Label>
                  <Textarea
                    id="comment"
                    placeholder="Please provide your feedback..."
                    rows={5}
                  />
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button className="flex-1" variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Request Revision
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Comments History */}
            <Card>
              <CardHeader>
                <CardTitle>Comments & History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No comments yet</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProofView;
