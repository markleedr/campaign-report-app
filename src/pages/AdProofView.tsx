import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate, useBlocker } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { toast } from "sonner";

// Previews
import { FacebookSingleImagePreview } from "@/components/ad-previews/FacebookSingleImagePreview";
import { LinkedInSingleImagePreview } from "@/components/ad-previews/LinkedInSingleImagePreview";
import { InstagramSingleImagePreview } from "@/components/ad-previews/InstagramSingleImagePreview";
import { FacebookStoryPreview } from "@/components/ad-previews/FacebookStoryPreview";

interface AdData {
  [key: string]: any;
}

const CTA_OPTIONS = [
  "Shop Now",
  "Learn More",
  "Sign Up",
  "Contact Us",
  "Book Now",
];

const AdProofView = () => {
  const { adProofId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: adProof, isLoading: loadingProof } = useQuery({
    queryKey: ["ad-proof", adProofId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_proofs")
        .select("*, campaigns(*, clients(name, logo_url))")
        .eq("id", adProofId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!adProofId,
  });

  const { data: latestVersion, isLoading: loadingVersion } = useQuery({
    queryKey: ["ad-proof-latest-version", adProofId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_proof_versions")
        .select("*")
        .eq("ad_proof_id", adProofId)
        .order("version_number", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data || null;
    },
    enabled: !!adProofId,
  });

  const [adData, setAdData] = useState<AdData>({});
  const [uploading, setUploading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();
  const initialDataRef = useRef<string>("");

  const handleChange = (key: string, value: string) => {
    setAdData((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `ad-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("ad-media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("ad-media").getPublicUrl(filePath);
      
      setAdData((prev) => ({ ...prev, imageUrl: data.publicUrl }));
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!adProof) throw new Error("No ad proof loaded");
      const nextVersion = (adProof.current_version || 0) + 1;

      const { error: insertErr } = await supabase
        .from("ad_proof_versions")
        .insert({
          ad_proof_id: adProof.id,
          version_number: nextVersion,
          ad_data: adData,
        });
      if (insertErr) throw insertErr;

      const { error: updateErr } = await supabase
        .from("ad_proofs")
        .update({ current_version: nextVersion })
        .eq("id", adProof.id);
      if (updateErr) throw updateErr;
    },
    onSuccess: () => {
      toast.success("Saved new version");
      initialDataRef.current = JSON.stringify(adData);
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ["ad-proof", adProofId] });
      queryClient.invalidateQueries({ queryKey: ["ad-proof-latest-version", adProofId] });
    },
    onError: () => toast.error("Failed to save changes"),
  });

  useEffect(() => {
    if (latestVersion?.ad_data) {
      setAdData(latestVersion.ad_data as AdData);
      initialDataRef.current = JSON.stringify(latestVersion.ad_data);
      setHasUnsavedChanges(false);
    }
  }, [latestVersion]);

  // Track unsaved changes
  useEffect(() => {
    if (initialDataRef.current) {
      const currentData = JSON.stringify(adData);
      setHasUnsavedChanges(currentData !== initialDataRef.current);
    }
  }, [adData]);

  // Auto-save every 3 minutes
  useEffect(() => {
    if (hasUnsavedChanges && !saveMutation.isPending) {
      autoSaveTimerRef.current = setTimeout(() => {
        saveMutation.mutate();
        toast.info("Auto-saved");
      }, 180000); // 3 minutes
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [hasUnsavedChanges, saveMutation]);

  // Browser navigation warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // In-app navigation blocking
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

  const Preview = useMemo(() => {
    if (!adProof) return null;
    const platform: string = adProof.platform;
    const format: string = adProof.ad_format;

    if (platform === "facebook" && format === "single-image") return FacebookSingleImagePreview as any;
    if (platform === "facebook" && format === "story") return FacebookStoryPreview as any;
    if (platform === "instagram" && format === "single-image") return InstagramSingleImagePreview as any;
    if (platform === "linkedin" && format === "single-image") return LinkedInSingleImagePreview as any;

    return null;
  }, [adProof]);

  const renderPreview = () => {
    if (!Preview) {
      return (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground">
          Preview not available for this format yet
        </div>
      );
    }

    // Get client data from campaign
    const clientName = (adProof as any)?.campaigns?.clients?.name || "Your Brand";
    const clientLogoUrl = (adProof as any)?.campaigns?.clients?.logo_url || "";

    // Map generic adData keys to preview props
    const props: any = {
      primaryText: adData.primaryText,
      headline: adData.headline,
      description: adData.description,
      callToAction: adData.callToAction,
      imageUrl: adData.imageUrl,
      linkUrl: adData.displayUrl,
      clientName,
      clientLogoUrl,
    };

    return <Preview {...props} />;
  };

  const keysToRender = useMemo(() => {
    // Define the fields in the order they appear in the ad preview
    const orderedFields = [
      "primaryText",      // Appears at top before image
      "imageUrl",         // The ad image
      "displayUrl",       // Shown in content card
      "headline",         // Main headline in content card
      "description",      // Description text in content card
      "callToAction",     // CTA button in content card
      "destinationUrl",   // Click-through URL (not visible in preview)
    ];
    
    // Only show fields that exist in adData or are in the ordered list
    return orderedFields.filter(field => 
      adData[field] !== undefined || orderedFields.includes(field)
    );
  }, [adData]);

  const isLoading = loadingProof || loadingVersion;

  return (
    <div className="min-h-screen bg-background">
      <AlertDialog open={blocker.state === "blocked" || showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Do you want to save them before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              if (blocker.state === "blocked") {
                blocker.reset();
              }
              setShowUnsavedDialog(false);
            }}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => {
                if (blocker.state === "blocked") {
                  blocker.proceed();
                } else {
                  navigate(-1);
                }
                setShowUnsavedDialog(false);
              }}
            >
              Leave Without Saving
            </Button>
            <AlertDialogAction
              onClick={async () => {
                await saveMutation.mutateAsync();
                if (blocker.state === "blocked") {
                  blocker.proceed();
                } else {
                  navigate(-1);
                }
                setShowUnsavedDialog(false);
              }}
            >
              Save & Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <header className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-6 py-6 flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => {
            if (hasUnsavedChanges) {
              setShowUnsavedDialog(true);
            } else {
              navigate(-1);
            }
          }}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ad Proof Editor</h1>
            <p className="text-sm text-muted-foreground">
              {adProof ? `${adProof.platform} • ${adProof.ad_format} • v${adProof.current_version}` : "Loading..."}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {hasUnsavedChanges && (
              <span className="text-sm text-muted-foreground">Unsaved changes</span>
            )}
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || isLoading || !hasUnsavedChanges}>
              <Save className="mr-2 h-4 w-4" /> {saveMutation.isPending ? "Saving..." : "Save as New Version"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ad Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : keysToRender.length === 0 ? (
                <p className="text-sm text-muted-foreground">No editable fields found.</p>
              ) : (
                keysToRender.map((key) => {
                  // Special handling for callToAction - use Select
                  if (key === "callToAction") {
                    return (
                      <div className="space-y-2" key={key}>
                        <Label htmlFor={key}>Call to Action</Label>
                        <Select
                          value={adData[key] ?? ""}
                          onValueChange={(value) => handleChange(key, value)}
                        >
                          <SelectTrigger id={key}>
                            <SelectValue placeholder="Select CTA" />
                          </SelectTrigger>
                          <SelectContent>
                            {CTA_OPTIONS.map((cta) => (
                              <SelectItem key={cta} value={cta}>
                                {cta}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  }

                  // Special handling for imageUrl - use file upload
                  if (key === "imageUrl") {
                    return (
                      <div className="space-y-2" key={key}>
                        <Label htmlFor={key}>Ad Image</Label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              id={key}
                              value={adData[key] ?? ""}
                              onChange={(e) => handleChange(key, e.target.value)}
                              placeholder="Or paste image URL"
                            />
                            <Label
                              htmlFor="image-upload"
                              className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                            >
                              <Upload className="h-4 w-4" />
                              {uploading ? "Uploading..." : "Upload"}
                            </Label>
                            <input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                              disabled={uploading}
                            />
                          </div>
                          {adData[key] && (
                            <div className="mt-2">
                              <img
                                src={adData[key]}
                                alt="Preview"
                                className="w-full max-w-xs rounded border"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Special handling for displayUrl and destinationUrl
                  if (key === "displayUrl") {
                    return (
                      <div className="space-y-2" key={key}>
                        <Label htmlFor={key}>Display URL</Label>
                        <Input
                          id={key}
                          value={adData[key] ?? ""}
                          onChange={(e) => handleChange(key, e.target.value)}
                          placeholder="e.g., stockwell.com.au/shop"
                        />
                      </div>
                    );
                  }

                  if (key === "destinationUrl") {
                    return (
                      <div className="space-y-2" key={key}>
                        <Label htmlFor={key}>Destination URL</Label>
                        <Input
                          id={key}
                          value={adData[key] ?? ""}
                          onChange={(e) => handleChange(key, e.target.value)}
                          placeholder="https://stockwell.com.au/shop"
                        />
                      </div>
                    );
                  }

                  // Default rendering for other fields
                  return (
                    <div className="space-y-2" key={key}>
                      <Label htmlFor={key}>{key}</Label>
                      {key.toLowerCase().includes("text") || key === "description" ? (
                        <Textarea
                          id={key}
                          value={adData[key] ?? ""}
                          onChange={(e) => handleChange(key, e.target.value)}
                          rows={4}
                        />
                      ) : (
                        <Input
                          id={key}
                          value={adData[key] ?? ""}
                          onChange={(e) => handleChange(key, e.target.value)}
                          placeholder={`Enter ${key}`}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>{renderPreview()}</CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdProofView;
