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
import { Plus, Edit, Trash2, Share2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ShareAdProofDialog } from "@/components/ShareAdProofDialog";

const CampaignDetail = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editName, setEditName] = useState("");
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

  const handleEdit = () => {
    if (campaign) {
      setEditName(campaign.name);
      setEditOpen(true);
    }
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      toast.error("Please fill in campaign name");
      return;
    }
    updateMutation.mutate();
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{campaign.name}</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {campaign.clients?.name}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/create?campaignId=${campaign.id}`)}
                className="flex-1 sm:flex-none"
              >
                <Plus className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Add New Ad</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">Edit Campaign</span>
                <span className="text-xs sm:hidden">Edit</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">Delete</span>
                <span className="text-xs sm:hidden">Del</span>
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Ad Proofs</CardTitle>
          </CardHeader>
          <CardContent>
            {!adProofs || adProofs.length === 0 ? (
              <p className="text-xs sm:text-sm text-muted-foreground text-center py-8">
                No ad proofs yet. Click "Add New Ad" to create one.
              </p>
            ) : (
              <div className="space-y-3">
                {adProofs.map((proof) => (
                  <div
                    key={proof.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm sm:text-base font-medium">
                        {proof.name || `${proof.platform} - ${proof.ad_format}`}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Version {proof.current_version}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedAdProofShareToken(proof.share_token);
                          setAdProofShareDialogOpen(true);
                        }}
                      >
                        <Share2 className="mr-1 h-3 w-3" />
                        <span className="text-xs">share</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          if (proof.platform === "google_pmax" || proof.ad_format === "pmax") {
                            navigate(`/pmax-builder?campaignId=${campaignId}&adProofId=${proof.id}`);
                          } else if (proof.ad_format === "carousel") {
                            navigate(`/carousel-builder?campaignId=${campaignId}&adProofId=${proof.id}&platform=${proof.platform}`);
                          } else {
                            navigate(`/ad/${proof.id}`);
                          }
                        }}
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        <span className="text-xs">edit</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setDeleteAdProofId(proof.id)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        <span className="text-xs">delete</span>
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
