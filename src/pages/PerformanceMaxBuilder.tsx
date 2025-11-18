import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Plus, Trash2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { ResizeImageModal } from "@/components/ResizeImageModal";

interface ImageAsset {
  file: File | null;
  preview: string;
}

interface AssetGroup {
  name: string;
  finalUrl: string;
  mobileUrl: string;
  headlines: string[];
  longHeadline: string;
  descriptions: string[];
  businessName: string;
  landscapeImages: ImageAsset[];
  squareImages: ImageAsset[];
  portraitImages: ImageAsset[];
  logos: ImageAsset[];
  videos: string[];
  cta: string;
  displayPath1: string;
  displayPath2: string;
}

const PerformanceMaxBuilder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const adProofId = searchParams.get("adProofId");
  const queryClient = useQueryClient();
  const [adName, setAdName] = useState("");

  const ctaOptions = [
    "Learn More",
    "Get Quote",
    "Sign Up",
    "Apply Now",
    "Book Now",
    "Contact Us",
    "Download",
    "Get Started",
    "Shop Now",
    "Subscribe",
  ];

  const [assetGroups, setAssetGroups] = useState<AssetGroup[]>([
    {
      name: "",
      finalUrl: "",
      mobileUrl: "",
      headlines: [""],
      longHeadline: "",
      descriptions: [""],
      businessName: "",
      landscapeImages: [],
      squareImages: [],
      portraitImages: [],
      logos: [],
      videos: [],
      cta: "",
      displayPath1: "",
      displayPath2: "",
    },
  ]);

  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [resizeModal, setResizeModal] = useState<{
    isOpen: boolean;
    file: File | null;
    type: "landscape" | "square" | "portrait" | "logos";
    groupIndex: number;
  }>({
    isOpen: false,
    file: null,
    type: "landscape",
    groupIndex: 0,
  });

  // Fetch existing ad proof data when editing
  const { data: existingAdProof } = useQuery({
    queryKey: ["ad-proof", adProofId],
    queryFn: async () => {
      if (!adProofId) return null;
      
      const { data: adProof, error: adProofError } = await supabase
        .from("ad_proofs")
        .select("*")
        .eq("id", adProofId)
        .single();
      
      if (adProofError) throw adProofError;
      
      const { data: version, error: versionError } = await supabase
        .from("ad_proof_versions")
        .select("*")
        .eq("ad_proof_id", adProofId)
        .eq("version_number", adProof.current_version)
        .single();
      
      if (versionError) throw versionError;
      
      return { adProof, version };
    },
    enabled: !!adProofId,
  });

  // Load existing data into state
  useEffect(() => {
    if (existingAdProof?.version?.ad_data) {
      const adData = existingAdProof.version.ad_data as any;
      if (adData.assetGroups && Array.isArray(adData.assetGroups)) {
        // Convert image URLs back to ImageAsset format
        const loadedGroups = adData.assetGroups.map((group: any) => ({
          ...group,
          landscapeImages: (group.landscapeImages || []).map((url: string) => ({
            file: null,
            preview: url,
          })),
          squareImages: (group.squareImages || []).map((url: string) => ({
            file: null,
            preview: url,
          })),
          portraitImages: (group.portraitImages || []).map((url: string) => ({
            file: null,
            preview: url,
          })),
          logos: (group.logos || []).map((url: string) => ({
            file: null,
            preview: url,
          })),
        }));
        setAssetGroups(loadedGroups);
      }
      if (adData.name) {
        setAdName(adData.name);
      }
    }
  }, [existingAdProof]);

  // Fetch campaign and client data
  const { data: campaignData } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*, clients(*)")
        .eq("id", campaignId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!campaignId,
  });

  const handleImageUpload = async (
    groupIndex: number,
    type: "landscape" | "square" | "portrait" | "logos",
    files: FileList | null
  ) => {
    if (!files) return;

    const maxLimits = { landscape: 20, square: 20, portrait: 20, logos: 5 };
    const newGroups = [...assetGroups];
    const imageKey = type === "logos" ? "logos" : `${type}Images`;
    const currentImages = newGroups[groupIndex][imageKey];

    const remainingSlots = maxLimits[type] - currentImages.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    const validatedAssets: ImageAsset[] = [];
    let firstRejectedFile: File | null = null;

    for (const file of filesToAdd) {
      try {
        const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve({ width: img.width, height: img.height });
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });

        const aspectRatio = dimensions.width / dimensions.height;
        let isValid = false;

        if (type === "landscape") {
          isValid = aspectRatio > 1.1;
        } else if (type === "square" || type === "logos") {
          isValid = aspectRatio >= 0.95 && aspectRatio <= 1.05;
        } else if (type === "portrait") {
          isValid = aspectRatio < 0.9;
        }

        if (isValid) {
          validatedAssets.push({
            file,
            preview: URL.createObjectURL(file),
          });
        } else if (!firstRejectedFile) {
          firstRejectedFile = file;
        }
      } catch (error) {
        if (!firstRejectedFile) {
          firstRejectedFile = file;
        }
      }
    }

    if (validatedAssets.length > 0) {
      newGroups[groupIndex][imageKey] = [...currentImages, ...validatedAssets];
      setAssetGroups(newGroups);
    }

    if (firstRejectedFile) {
      setResizeModal({
        isOpen: true,
        file: firstRejectedFile,
        type,
        groupIndex,
      });
    }
  };

  const removeImage = (
    groupIndex: number,
    type: "landscape" | "square" | "portrait" | "logos",
    imageIndex: number
  ) => {
    const newGroups = [...assetGroups];
    const imageKey = type === "logos" ? "logos" : `${type}Images`;
    newGroups[groupIndex][imageKey].splice(imageIndex, 1);
    setAssetGroups(newGroups);
  };

  const handleResizedImageSave = (file: File) => {
    const { groupIndex, type } = resizeModal;
    const newGroups = [...assetGroups];
    const imageKey = type === "logos" ? "logos" : `${type}Images`;
    
    newGroups[groupIndex][imageKey].push({
      file,
      preview: URL.createObjectURL(file),
    });
    
    setAssetGroups(newGroups);
    toast.success("Image resized and added successfully!");
  };

  const addAssetGroup = () => {
    setAssetGroups([
      ...assetGroups,
      {
        name: "",
        finalUrl: "",
        mobileUrl: "",
        headlines: [""],
        longHeadline: "",
        descriptions: [""],
        businessName: "",
        landscapeImages: [],
        squareImages: [],
        portraitImages: [],
        logos: [],
        videos: [],
        cta: "",
        displayPath1: "",
        displayPath2: "",
      },
    ]);
    setActiveGroupIndex(assetGroups.length);
  };

  const removeAssetGroup = (index: number) => {
    if (assetGroups.length === 1) {
      toast.error("You must have at least one asset group");
      return;
    }
    const newGroups = assetGroups.filter((_, i) => i !== index);
    setAssetGroups(newGroups);
    if (activeGroupIndex >= newGroups.length) {
      setActiveGroupIndex(newGroups.length - 1);
    }
  };

  const updateAssetGroup = (index: number, field: string, value: any) => {
    const newGroups = [...assetGroups];
    (newGroups[index] as any)[field] = value;
    setAssetGroups(newGroups);
  };

  const updateArrayField = (
    groupIndex: number,
    field: "headlines" | "descriptions",
    itemIndex: number,
    value: string
  ) => {
    const newGroups = [...assetGroups];
    newGroups[groupIndex][field][itemIndex] = value;
    setAssetGroups(newGroups);
  };

  const addVideo = (groupIndex: number, url: string) => {
    const newGroups = [...assetGroups];
    if (newGroups[groupIndex].videos.length < 5) {
      newGroups[groupIndex].videos.push(url);
      setAssetGroups(newGroups);
    }
  };

  const removeVideo = (groupIndex: number, videoIndex: number) => {
    const newGroups = [...assetGroups];
    newGroups[groupIndex].videos.splice(videoIndex, 1);
    setAssetGroups(newGroups);
  };

  const validateAssetGroup = (group: AssetGroup) => {
    const errors: string[] = [];

    if (!group.finalUrl) errors.push("Final URL is required");
    if (group.landscapeImages.length === 0) errors.push("At least 1 landscape image required");
    if (group.squareImages.length === 0) errors.push("At least 1 square image required");
    if (group.logos.length === 0) errors.push("At least 1 logo required");

    const filledHeadlines = group.headlines.filter((h) => h.trim()).length;
    if (filledHeadlines < 1) errors.push("At least 1 headline required");

    const filledDescriptions = group.descriptions.filter((d) => d.trim()).length;
    if (filledDescriptions < 1) errors.push("At least 1 description required");

    return errors;
  };

  const exportJSON = () => {
    const exportData = assetGroups.map((group) => ({
      assetGroupName: group.name,
      finalUrl: group.finalUrl,
      mobileUrl: group.mobileUrl,
      textAssets: {
        headlines: group.headlines.filter((h) => h.trim()),
        longHeadline: group.longHeadline,
        descriptions: group.descriptions.filter((d) => d.trim()),
        businessName: group.businessName,
      },
      images: {
        landscape: group.landscapeImages.map((img) => img.preview),
        square: group.squareImages.map((img) => img.preview),
        portrait: group.portraitImages.map((img) => img.preview),
        logos: group.logos.map((img) => img.preview),
      },
      videos: group.videos,
      cta: group.cta,
      displayPath: {
        path1: group.displayPath1,
        path2: group.displayPath2,
      },
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pmax-campaign-${campaignId}.json`;
    link.click();
    toast.success("Campaign data exported");
  };

  const saveAdProof = useMutation({
    mutationFn: async () => {
      console.log("=== SAVE AD PROOF STARTED ===");
      console.log("Campaign ID:", campaignId);
      console.log("Ad Proof ID:", adProofId);
      console.log("Asset Groups:", assetGroups);
      
      if (!campaignId) throw new Error("Missing campaign information");

      // Validate all asset groups
      const allErrors: string[] = [];
      assetGroups.forEach((group, index) => {
        console.log(`Validating Asset Group ${index + 1}:`, {
          name: group.name,
          landscapeCount: group.landscapeImages.length,
          squareCount: group.squareImages.length,
          logosCount: group.logos.length,
          landscapeImages: group.landscapeImages,
          squareImages: group.squareImages,
          logos: group.logos,
        });
        
        const errors = validateAssetGroup(group);
        if (errors.length > 0) {
          console.log(`Errors for group ${index + 1}:`, errors);
          allErrors.push(`Asset Group ${index + 1}: ${errors.join(", ")}`);
        }
      });

      if (allErrors.length > 0) {
        console.error("Validation failed:", allErrors);
        throw new Error(`Validation failed:\n${allErrors.join("\n")}`);
      }
      
      console.log("Validation passed, proceeding with upload...");

      // Use existing share token if editing, otherwise generate new one
      const shareToken = adProofId && existingAdProof?.adProof?.share_token 
        ? existingAdProof.adProof.share_token 
        : Math.random().toString(36).substring(2, 14);

      // Upload all images (only upload new files, keep existing URLs)
      const uploadedAssetGroups = await Promise.all(
        assetGroups.map(async (group, groupIdx) => {
          const uploadImage = async (image: ImageAsset, path: string) => {
            // If no file but has preview URL, it's an existing image - keep the URL
            if (!image.file && image.preview) return image.preview;
            // If no file at all, return empty string
            if (!image.file) return "";
            
            const { error } = await supabase.storage.from("ad-media").upload(path, image.file, {
              upsert: true, // Overwrite if exists
            });
            if (error) throw error;
            const {
              data: { publicUrl },
            } = supabase.storage.from("ad-media").getPublicUrl(path);
            return publicUrl;
          };

          const landscapeUrls = await Promise.all(
            group.landscapeImages.map((img, i) =>
              uploadImage(img, `${campaignId}/${shareToken}/landscape-${i}.jpg`)
            )
          );
          const squareUrls = await Promise.all(
            group.squareImages.map((img, i) =>
              uploadImage(img, `${campaignId}/${shareToken}/square-${i}.jpg`)
            )
          );
          const portraitUrls = await Promise.all(
            group.portraitImages.map((img, i) =>
              uploadImage(img, `${campaignId}/${shareToken}/portrait-${i}.jpg`)
            )
          );
          const logoUrls = await Promise.all(
            group.logos.map((img, i) => uploadImage(img, `${campaignId}/${shareToken}/logo-${i}.jpg`))
          );

          return {
            ...group,
            landscapeImages: landscapeUrls,
            squareImages: squareUrls,
            portraitImages: portraitUrls,
            logos: logoUrls,
          };
        })
      );

      let adProofIdToUse = adProofId;

      if (adProofId) {
        // Update existing ad proof
        const { error: updateError } = await supabase
          .from("ad_proofs")
          .update({
            updated_at: new Date().toISOString(),
            name: adName || null,
          })
          .eq("id", adProofId);

        if (updateError) throw updateError;

        // Get current version number
        const currentVersion = existingAdProof?.adProof?.current_version || 1;
        const newVersion = currentVersion + 1;

        // Create new version
        const { error: versionError } = await supabase.from("ad_proof_versions").insert({
          ad_proof_id: adProofId,
          version_number: newVersion,
          ad_data: { name: adName, assetGroups: uploadedAssetGroups },
        });

        if (versionError) throw versionError;

        // Update current version
        const { error: updateVersionError } = await supabase
          .from("ad_proofs")
          .update({ current_version: newVersion })
          .eq("id", adProofId);

        if (updateVersionError) throw updateVersionError;
      } else {
        // Create new ad proof
        const { data: adProof, error: adProofError } = await supabase
          .from("ad_proofs")
          .insert({
            campaign_id: campaignId,
            platform: "google_pmax",
            ad_format: "pmax",
            share_token: shareToken,
            status: "pending",
            name: adName || null,
          })
          .select()
          .single();

        if (adProofError) throw adProofError;

        // Create first version with asset group data
        const { error: versionError } = await supabase.from("ad_proof_versions").insert({
          ad_proof_id: adProof.id,
          version_number: 1,
          ad_data: { name: adName, assetGroups: uploadedAssetGroups },
        });

        if (versionError) throw versionError;

        adProofIdToUse = adProof.id;
      }

      return adProofIdToUse;
    },
    onSuccess: (savedAdProofId) => {
      toast.success(adProofId ? "Changes saved successfully!" : "Performance Max campaign created successfully!");
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["ad-proofs", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["ad-proof", adProofId] });
      navigate(`/campaign/${campaignId}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const activeGroup = assetGroups[activeGroupIndex];
  const characterCount = (text: string, limit: number) => `${text.length}/${limit}`;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(`/campaign/${campaignId}`)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaign
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Performance Max Campaign Builder</h1>
              <p className="text-muted-foreground mt-1">
                {campaignData?.name} • {campaignData?.clients?.name}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportJSON}>
                <Download className="mr-2 h-4 w-4" />
                Export JSON
              </Button>
              <Button onClick={() => saveAdProof.mutate()} disabled={saveAdProof.isPending}>
                {saveAdProof.isPending ? "Saving..." : adProofId ? "Save Changes" : "Create Campaign"}
              </Button>
            </div>
          </div>
        </div>

        {/* Ad Name */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="adName">Ad Name (Optional)</Label>
              <Input
                id="adName"
                value={adName}
                onChange={(e) => setAdName(e.target.value)}
                placeholder="Enter a name for this ad"
              />
            </div>
          </CardContent>
        </Card>

        {/* Asset Group Tabs */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto">
          {assetGroups.map((group, index) => (
            <div key={index} className="flex items-center gap-1">
              <Button
                variant={activeGroupIndex === index ? "default" : "outline"}
                onClick={() => setActiveGroupIndex(index)}
                size="sm"
              >
                {group.name || `Asset Group ${index + 1}`}
              </Button>
              {assetGroups.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeAssetGroup(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addAssetGroup}>
            <Plus className="mr-1 h-4 w-4" />
            Add Asset Group
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="p-6">
            <div className="space-y-6">
              {/* Basic Fields */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div>
                  <Label>Asset Group Name</Label>
                  <Input
                    value={activeGroup.name}
                    onChange={(e) => updateAssetGroup(activeGroupIndex, "name", e.target.value)}
                    placeholder="e.g., Spring Collection 2024"
                  />
                </div>
                <div>
                  <Label>
                    Final URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="url"
                    value={activeGroup.finalUrl}
                    onChange={(e) => updateAssetGroup(activeGroupIndex, "finalUrl", e.target.value)}
                    placeholder="https://example.com/landing-page"
                    required
                  />
                </div>
                <div>
                  <Label>Mobile URL (Optional)</Label>
                  <Input
                    type="url"
                    value={activeGroup.mobileUrl}
                    onChange={(e) => updateAssetGroup(activeGroupIndex, "mobileUrl", e.target.value)}
                    placeholder="https://m.example.com/landing-page"
                  />
                </div>
              </div>

              {/* Text Assets */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-lg font-semibold">Text Assets</h3>

                <div>
                  <Label>
                    Headlines <span className="text-destructive">*</span> (up to 5)
                  </Label>
                  <div className="space-y-2 mt-2">
                    {activeGroup.headlines.map((headline, idx) => (
                      <div key={idx}>
                        <Input
                          value={headline}
                          onChange={(e) => {
                            const value = e.target.value.slice(0, 30);
                            updateArrayField(activeGroupIndex, "headlines", idx, value);
                            // Add next field if current is filled and under limit
                            if (value.trim() && idx === activeGroup.headlines.length - 1 && activeGroup.headlines.length < 5) {
                              const newGroups = [...assetGroups];
                              newGroups[activeGroupIndex].headlines.push("");
                              setAssetGroups(newGroups);
                            }
                          }}
                          placeholder={`Headline ${idx + 1}`}
                          maxLength={30}
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          {characterCount(headline, 30)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Long Headline</Label>
                  <Input
                    value={activeGroup.longHeadline}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, 90);
                      updateAssetGroup(activeGroupIndex, "longHeadline", value);
                    }}
                    placeholder="Enter long headline"
                    maxLength={90}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {characterCount(activeGroup.longHeadline, 90)}
                  </div>
                </div>

                <div>
                  <Label>
                    Descriptions <span className="text-destructive">*</span> (up to 4)
                  </Label>
                  <div className="space-y-2 mt-2">
                    {activeGroup.descriptions.map((description, idx) => (
                      <div key={idx}>
                        <Textarea
                          value={description}
                          onChange={(e) => {
                            const value = e.target.value.slice(0, 90);
                            updateArrayField(activeGroupIndex, "descriptions", idx, value);
                            // Add next field if current is filled and under limit
                            if (value.trim() && idx === activeGroup.descriptions.length - 1 && activeGroup.descriptions.length < 4) {
                              const newGroups = [...assetGroups];
                              newGroups[activeGroupIndex].descriptions.push("");
                              setAssetGroups(newGroups);
                            }
                          }}
                          placeholder={`Description ${idx + 1}`}
                          maxLength={90}
                          rows={2}
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          {characterCount(description, 90)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Business Name</Label>
                  <Input
                    value={activeGroup.businessName}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, 25);
                      updateAssetGroup(activeGroupIndex, "businessName", value);
                    }}
                    placeholder="Your Business Name"
                    maxLength={25}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {characterCount(activeGroup.businessName, 25)}
                  </div>
                </div>
              </div>

              {/* Image Assets */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-lg font-semibold">Image Assets</h3>

                {/* Landscape Images */}
                <div>
                  <Label>
                    Landscape Images (1200 x 628) <span className="text-destructive">* Min: 1, Max: 20</span>
                  </Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      multiple
                      onChange={(e) => handleImageUpload(activeGroupIndex, "landscape", e.target.files)}
                      className="hidden"
                      id={`landscape-${activeGroupIndex}`}
                      disabled={activeGroup.landscapeImages.length >= 20}
                    />
                    <label htmlFor={`landscape-${activeGroupIndex}`}>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={activeGroup.landscapeImages.length >= 20}
                        asChild
                      >
                        <span>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Landscape ({activeGroup.landscapeImages.length}/20)
                        </span>
                      </Button>
                    </label>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {activeGroup.landscapeImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img.preview} alt="" className="w-full h-24 object-cover rounded" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => removeImage(activeGroupIndex, "landscape", idx)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Square Images */}
                <div>
                  <Label>
                    Square Images (1200 x 1200) <span className="text-destructive">* Min: 1, Max: 20</span>
                  </Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      multiple
                      onChange={(e) => handleImageUpload(activeGroupIndex, "square", e.target.files)}
                      className="hidden"
                      id={`square-${activeGroupIndex}`}
                      disabled={activeGroup.squareImages.length >= 20}
                    />
                    <label htmlFor={`square-${activeGroupIndex}`}>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={activeGroup.squareImages.length >= 20}
                        asChild
                      >
                        <span>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Square ({activeGroup.squareImages.length}/20)
                        </span>
                      </Button>
                    </label>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {activeGroup.squareImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img.preview} alt="" className="w-full h-24 object-cover rounded" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => removeImage(activeGroupIndex, "square", idx)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Portrait Images */}
                <div>
                  <Label>Portrait Images (960 x 1200) Optional, Max: 20</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      multiple
                      onChange={(e) => handleImageUpload(activeGroupIndex, "portrait", e.target.files)}
                      className="hidden"
                      id={`portrait-${activeGroupIndex}`}
                      disabled={activeGroup.portraitImages.length >= 20}
                    />
                    <label htmlFor={`portrait-${activeGroupIndex}`}>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={activeGroup.portraitImages.length >= 20}
                        asChild
                      >
                        <span>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Portrait ({activeGroup.portraitImages.length}/20)
                        </span>
                      </Button>
                    </label>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {activeGroup.portraitImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img.preview} alt="" className="w-full h-24 object-cover rounded" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => removeImage(activeGroupIndex, "portrait", idx)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Logos */}
                <div>
                  <Label>
                    Logos (Square, 1:1) <span className="text-destructive">* Min: 1, Max: 5</span>
                  </Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      multiple
                      onChange={(e) => handleImageUpload(activeGroupIndex, "logos", e.target.files)}
                      className="hidden"
                      id={`logos-${activeGroupIndex}`}
                      disabled={activeGroup.logos.length >= 5}
                    />
                    <label htmlFor={`logos-${activeGroupIndex}`}>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={activeGroup.logos.length >= 5}
                        asChild
                      >
                        <span>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Logo ({activeGroup.logos.length}/5)
                        </span>
                      </Button>
                    </label>
                  </div>
                  <div className="grid grid-cols-6 gap-2 mt-2">
                    {activeGroup.logos.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img.preview} alt="" className="w-full h-16 object-cover rounded" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => removeImage(activeGroupIndex, "logos", idx)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Video Assets */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-lg font-semibold">Video Assets</h3>
                <p className="text-sm text-muted-foreground">
                  Optional. Max 5 videos. Google may auto-generate video if none supplied.
                </p>
                <div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Video URL (YouTube, etc.)"
                      id={`video-input-${activeGroupIndex}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.getElementById(
                          `video-input-${activeGroupIndex}`
                        ) as HTMLInputElement;
                        if (input.value) {
                          addVideo(activeGroupIndex, input.value);
                          input.value = "";
                        }
                      }}
                      disabled={activeGroup.videos.length >= 5}
                    >
                      Add Video
                    </Button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {activeGroup.videos.map((video, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm truncate">{video}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeVideo(activeGroupIndex, idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Call to Action & Display Path */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Settings</h3>
                <div>
                  <Label>Call to Action (Optional)</Label>
                  <Select
                    value={activeGroup.cta}
                    onValueChange={(value) => updateAssetGroup(activeGroupIndex, "cta", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select CTA" />
                    </SelectTrigger>
                    <SelectContent>
                      {ctaOptions.map((cta) => (
                        <SelectItem key={cta} value={cta}>
                          {cta}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Display Path 1 (Optional, max 15 chars)</Label>
                    <Input
                      value={activeGroup.displayPath1}
                      onChange={(e) => {
                        const value = e.target.value.slice(0, 15);
                        updateAssetGroup(activeGroupIndex, "displayPath1", value);
                      }}
                      placeholder="spring"
                      maxLength={15}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {characterCount(activeGroup.displayPath1, 15)}
                    </div>
                  </div>
                  <div>
                    <Label>Display Path 2 (Optional, max 15 chars)</Label>
                    <Input
                      value={activeGroup.displayPath2}
                      onChange={(e) => {
                        const value = e.target.value.slice(0, 15);
                        updateAssetGroup(activeGroupIndex, "displayPath2", value);
                      }}
                      placeholder="sale"
                      maxLength={15}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {characterCount(activeGroup.displayPath2, 15)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Validation Warnings */}
              {(() => {
                const errors = validateAssetGroup(activeGroup);
                if (errors.length === 0) return null;
                return (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-4">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                      Validation Warnings
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800 dark:text-yellow-300">
                      {errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </Card>
        </div>
      </div>

      <ResizeImageModal
        isOpen={resizeModal.isOpen}
        onClose={() => setResizeModal({ ...resizeModal, isOpen: false })}
        onSave={handleResizedImageSave}
        imageFile={resizeModal.file}
        targetType={resizeModal.type}
      />
    </div>
  );
};

export default PerformanceMaxBuilder;
