import { useParams } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThumbsUp, MessageSquare, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { FacebookSingleImagePreview } from "@/components/ad-previews/FacebookSingleImagePreview";
import { FacebookStoryPreview } from "@/components/ad-previews/FacebookStoryPreview";
import { FacebookCarouselPreview } from "@/components/ad-previews/FacebookCarouselPreview";
import { InstagramSingleImagePreview } from "@/components/ad-previews/InstagramSingleImagePreview";
import { InstagramStoryPreview } from "@/components/ad-previews/InstagramStoryPreview";
import { InstagramCarouselPreview } from "@/components/ad-previews/InstagramCarouselPreview";
import { LinkedInSingleImagePreview } from "@/components/ad-previews/LinkedInSingleImagePreview";
import { LinkedInCarouselPreview } from "@/components/ad-previews/LinkedInCarouselPreview";
import { GooglePerformanceMaxPreview } from "@/components/ad-previews/GooglePerformanceMaxPreview";

const ProofView = () => {
  const { shareToken } = useParams();
  const queryClient = useQueryClient();
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [approverName, setApproverName] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: adProofData, isLoading } = useQuery({
    queryKey: ["adProof", shareToken],
    queryFn: async () => {
      const { data: adProof, error: proofError } = await supabase
        .from("ad_proofs")
        .select("*, campaigns(name, client_id, clients(name, logo_url))")
        .eq("share_token", shareToken)
        .single();

      if (proofError) throw proofError;

      // Fetch all versions
      const { data: versions, error: versionsError } = await supabase
        .from("ad_proof_versions")
        .select("*")
        .eq("ad_proof_id", adProof.id)
        .order("version_number", { ascending: false });

      if (versionsError) throw versionsError;

      // Fetch approvals
      const { data: approvals, error: approvalsError } = await supabase
        .from("approvals")
        .select("*")
        .eq("ad_proof_id", adProof.id)
        .order("created_at", { ascending: false });

      if (approvalsError) throw approvalsError;

      return { adProof, versions, approvals: approvals || [] };
    },
  });

  // Set initial selected version to current version
  if (adProofData && selectedVersion === null) {
    setSelectedVersion(adProofData.adProof.current_version);
  }

  const currentVersion = adProofData?.versions?.find(
    v => v.version_number === selectedVersion
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!adProofData || !currentVersion) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Ad Proof Not Found</h2>
          <p className="text-muted-foreground">This share link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const { adProof, versions, approvals } = adProofData;
  const adData = currentVersion.ad_data as any;
  const campaign = adProof.campaigns as any;
  const client = campaign?.clients;

  const submitFeedback = useMutation({
    mutationFn: async (decision: "approved" | "revision") => {
      setIsSubmitting(true);
      
      // Insert approval
      const { error: approvalError } = await supabase
        .from("approvals")
        .insert({
          ad_proof_id: adProof.id,
          version_number: selectedVersion || adProof.current_version,
          decision,
          comment,
          approver_name: approverName,
        });

      if (approvalError) throw approvalError;

      // Send email notification
      try {
        await supabase.functions.invoke("send-approval-notification", {
          body: {
            adProofId: adProof.id,
            approverName,
            decision,
            comment,
            campaignName: campaign.name,
            clientName: client.name,
          },
        });
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
      }

      return decision;
    },
    onSuccess: (decision) => {
      setIsSubmitting(false);
      toast.success(
        decision === "approved" 
          ? "Your approval has been submitted!" 
          : "Your revision request has been submitted!"
      );
      setApproverName("");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["adProof", shareToken] });
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast.error("Failed to submit feedback. Please try again.");
      console.error(error);
    },
  });

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
    } else if (platform === "google_pmax" || platform === "google-pmax") {
      if (format === "pmax") {
        return <GooglePerformanceMaxPreview 
          assetGroups={adData.assetGroups}
          clientName={client?.name}
          clientLogoUrl={client?.logo_url}
        />;
      }
    }

    return <div className="text-muted-foreground p-8 text-center">Preview not available for this ad type: {platform} - {format}</div>;
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
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">{client?.name} - {campaign?.name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-muted-foreground">
                {adProof.platform === "facebook" && "Facebook"}
                {adProof.platform === "instagram" && "Instagram"}
                {adProof.platform === "linkedin" && "LinkedIn"}
                {(adProof.platform === "google_pmax" || adProof.platform === "google-pmax") && "Google Performance Max"}
                {" • "}
                {(adProof.ad_format === "single_image" || adProof.ad_format === "single-image") && "Single Image"}
                {adProof.ad_format === "story" && "Story"}
                {adProof.ad_format === "carousel" && "Carousel"}
                {adProof.ad_format === "pmax" && "Performance Max"}
              </p>
              <span className="text-muted-foreground">•</span>
              <p className="text-sm text-muted-foreground">
                Version {selectedVersion} {selectedVersion === adProof.current_version && "(Current)"}
              </p>
            </div>
          </div>
          
          {versions && versions.length > 1 && (
            <Select
              value={selectedVersion?.toString()}
              onValueChange={(value) => setSelectedVersion(parseInt(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((v) => (
                  <SelectItem key={v.id} value={v.version_number.toString()}>
                    Version {v.version_number}
                    {v.version_number === adProof.current_version && " (Current)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
                  <Input 
                    id="name" 
                    placeholder="Enter your name" 
                    value={approverName}
                    onChange={(e) => setApproverName(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment">Comment *</Label>
                  <Textarea
                    id="comment"
                    placeholder="Please provide your feedback..."
                    rows={5}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => submitFeedback.mutate("approved")}
                    disabled={!approverName.trim() || !comment.trim() || isSubmitting}
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button 
                    className="flex-1" 
                    variant="outline"
                    onClick={() => submitFeedback.mutate("revision")}
                    disabled={!approverName.trim() || !comment.trim() || isSubmitting}
                  >
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
                {approvals && approvals.length > 0 ? (
                  <div className="space-y-4">
                    {approvals.map((approval: any) => (
                      <div key={approval.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-start gap-2 mb-2">
                          {approval.decision === "approved" ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          ) : (
                            <MessageSquare className="h-5 w-5 text-orange-600 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm">{approval.approver_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(approval.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {approval.decision === "approved" ? "Approved" : "Requested Revision"} - Version {approval.version_number}
                            </p>
                            <p className="text-sm mt-1">{approval.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No feedback yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProofView;
