import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Share2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ShareAdProofDialog } from "@/components/ShareAdProofDialog";

const platforms = [
  { value: "google-pmax", label: "Google Performance Max" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
];

const CampaignDetail = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPlatform, setEditPlatform] = useState("");
  const [selectedAdProofShareToken, setSelectedAdProofShareToken] = useState<string>("");
  const [adProofShareDialogOpen, setAdProofShareDialogOpen] = useState(false);
  const [deleteAdProofId, setDeleteAdProofId] = useState<string>("");

  const { data: campaign, isLoading } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*, clients(name)")
        .eq("id", campaignId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: adProofs } = useQuery({
    queryKey: ["ad-proofs", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_proofs")
        .select("*")
        .eq("campaign_id", campaignId);

      if (error) throw error;
      return data;
    },
    enabled: !!campaignId,
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("campaigns")
        .update({
          name: editName,
          platform: editPlatform,
        })
        .eq("id", campaignId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign updated successfully");
      setEditOpen(false);
    },
    onError: () => {
      toast.error("Failed to update campaign");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", campaignId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign deleted successfully");
      navigate("/dashboard");
    },
    onError: () => {
      toast.error("Failed to delete campaign");
    },
  });

  const deleteAdProofMutation = useMutation({
    mutationFn: async (adProofId: string) => {
      const { error } = await supabase
        .from("ad_proofs")
        .delete()
        .eq("id", adProofId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-proofs", campaignId] });
      toast.success("Ad proof deleted successfully");
      setDeleteAdProofId("");
    },
    onError: () => {
      toast.error("Failed to delete ad proof");
    },
  });

  const generateShareLinkMutation = useMutation({
    mutationFn: async () => {
      if (campaign?.share_token) {
        return campaign.share_token;
      }

      const { data, error } = await supabase.rpc("generate_campaign_share_token");
      if (error) throw error;

      const { error: updateError } = await supabase
        .from("campaigns")
        .update({ share_token: data })
        .eq("id", campaignId);

      if (updateError) throw updateError;

      await queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] });
      return data;
    },
    onSuccess: () => {
      setShareOpen(true);
    },
    onError: () => {
      toast.error("Failed to generate share link");
    },
  });

  const handleEdit = () => {
    if (campaign) {
      setEditName(campaign.name);
      setEditPlatform(campaign.platform || "");
      setEditOpen(true);
    }
  };

  const handleSaveEdit = () => {
    if (!editName.trim() || !editPlatform) {
      toast.error("Please fill in all fields");
      return;
    }
    updateMutation.mutate();
  };

  const shareUrl = campaign?.share_token
    ? `${window.location.origin}/c/${campaign.share_token}`
    : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="mx-auto px-6 py-8">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="mx-auto px-6 py-8">
          <p className="text-muted-foreground">Campaign not found</p>
        </main>
      </div>
    );
  }

  const platformLabel = platforms.find((p) => p.value === campaign.platform)?.label || campaign.platform;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="mx-auto px-6 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{campaign.name}</h1>
              <p className="text-muted-foreground">
                {campaign.clients?.name} • {platformLabel}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/create?campaignId=${campaign.id}`)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Ad
              </Button>
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Campaign
              </Button>
              <Button
                variant="outline"
                onClick={() => generateShareLinkMutation.mutate()}
                disabled={generateShareLinkMutation.isPending}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ad Proofs</CardTitle>
          </CardHeader>
          <CardContent>
            {!adProofs || adProofs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No ad proofs yet. Click "Add New Ad" to create one.
              </p>
            ) : (
              <div className="space-y-3">
                {adProofs.map((proof) => (
                  <div
                    key={proof.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">
                        {proof.platform} - {proof.ad_format}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Version {proof.current_version} • {proof.status}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedAdProofShareToken(proof.share_token);
                          setAdProofShareDialogOpen(true);
                        }}
                      >
                        <Share2 className="mr-1 h-3 w-3" />
                        share
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/ad/${proof.id}`)}
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setDeleteAdProofId(proof.id)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="left" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Edit Campaign</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Campaign Name *</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-platform">Platform *</Label>
              <Select value={editPlatform} onValueChange={setEditPlatform}>
                <SelectTrigger id="edit-platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this campaign and all associated ad proofs.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Campaign"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Dialog */}
      <AlertDialog open={shareOpen} onOpenChange={setShareOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Share Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Share this link with your client to view all ads in this campaign and provide feedback.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Input value={shareUrl} readOnly className="font-mono text-sm" />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={handleCopyLink}>
              Copy Link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Ad Proof Confirmation */}
      <AlertDialog open={!!deleteAdProofId} onOpenChange={() => setDeleteAdProofId("")}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this ad proof and all its versions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAdProofMutation.mutate(deleteAdProofId)}
              disabled={deleteAdProofMutation.isPending}
            >
              {deleteAdProofMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Ad Proof Dialog */}
      <ShareAdProofDialog 
        open={adProofShareDialogOpen}
        onOpenChange={setAdProofShareDialogOpen}
        shareToken={selectedAdProofShareToken}
      />
    </div>
  );
};

export default CampaignDetail;
