import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { FacebookSingleImagePreview } from "@/components/ad-previews/FacebookSingleImagePreview";
import { FacebookStoryPreview } from "@/components/ad-previews/FacebookStoryPreview";
import { InstagramSingleImagePreview } from "@/components/ad-previews/InstagramSingleImagePreview";
import { LinkedInSingleImagePreview } from "@/components/ad-previews/LinkedInSingleImagePreview";

const AdBuilder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const platform = searchParams.get("platform");
  const format = searchParams.get("format");
  const queryClient = useQueryClient();

  // Redirect to Performance Max builder if needed
  if (platform === "google_pmax" && format === "pmax") {
    navigate(`/pmax-builder?campaignId=${campaignId}&platform=${platform}&format=${format}`, { replace: true });
    return null;
  }

  const platformNames: Record<string, string> = {
    facebook: "Facebook",
    instagram: "Instagram",
    linkedin: "LinkedIn",
    youtube: "YouTube",
    google_pmax: "Google Performance Max",
  };

  const formatNames: Record<string, string> = {
    single_image: "Single Image Feed",
    story: "Story",
    carousel: "Carousel",
    video: "Video Ad",
    pmax: "Performance Max",
  };

  const [adData, setAdData] = useState({
    name: "",
    headline: "",
    primaryText: "",
    description: "",
    linkUrl: "",
    callToAction: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const createAdProof = useMutation({
    mutationFn: async () => {
      if (!campaignId || !platform || !format) {
        throw new Error("Missing campaign information");
      }

      // Generate share token
      const shareToken = Math.random().toString(36).substring(2, 14);

      // Upload image to storage if present
      let imageUrl = "";
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const filePath = `${campaignId}/${shareToken}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("ad-media")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("ad-media")
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Create ad proof
      const { data: adProof, error: adProofError } = await supabase
        .from("ad_proofs")
        .insert({
          campaign_id: campaignId,
          platform: platform,
          ad_format: format,
          share_token: shareToken,
          status: "pending",
          name: adData.name || null,
        })
        .select()
        .single();

      if (adProofError) throw adProofError;

      // Create first version with ad data
      const { error: versionError } = await supabase
        .from("ad_proof_versions")
        .insert({
          ad_proof_id: adProof.id,
          version_number: 1,
          ad_data: {
            ...adData,
            imageUrl,
          },
        });

      if (versionError) throw versionError;

      return adProof;
    },
    onSuccess: (adProof) => {
      toast.success("Ad proof created successfully");
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      navigate(`/proof/${adProof.share_token}`);
    },
    onError: (error) => {
      toast.error("Failed to create ad proof");
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adData.headline || !adData.primaryText) {
      toast.error("Please fill in required fields");
      return;
    }
    createAdProof.mutate();
  };

  const getCharacterLimit = (field: string) => {
    const limits: Record<string, number> = {
      headline: 40,
      primaryText: 125,
      description: 30,
    };
    return limits[field] || 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="mb-6 text-3xl font-bold text-foreground">
          Build Your {platform ? platformNames[platform] : ""} {format ? formatNames[format] : ""} Ad
        </h1>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Panel - Input Fields */}
          <div className="space-y-6">
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Ad Name (Optional)
                  </Label>
                  <Input
                    id="name"
                    value={adData.name}
                    onChange={(e) =>
                      setAdData({ ...adData, name: e.target.value })
                    }
                    placeholder="Enter a name for this ad"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="headline">
                    Headline * ({adData.headline.length}/{getCharacterLimit("headline")})
                  </Label>
                  <Input
                    id="headline"
                    value={adData.headline}
                    onChange={(e) =>
                      setAdData({ ...adData, headline: e.target.value.slice(0, getCharacterLimit("headline")) })
                    }
                    placeholder="Enter your headline"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryText">
                    Primary Text * ({adData.primaryText.length}/{getCharacterLimit("primaryText")})
                  </Label>
                  <Textarea
                    id="primaryText"
                    value={adData.primaryText}
                    onChange={(e) =>
                      setAdData({
                        ...adData,
                        primaryText: e.target.value.slice(0, getCharacterLimit("primaryText")),
                      })
                    }
                    placeholder="Enter your ad copy"
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description ({adData.description.length}/{getCharacterLimit("description")})
                  </Label>
                  <Input
                    id="description"
                    value={adData.description}
                    onChange={(e) =>
                      setAdData({
                        ...adData,
                        description: e.target.value.slice(0, getCharacterLimit("description")),
                      })
                    }
                    placeholder="Enter description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkUrl">Link URL</Label>
                  <Input
                    id="linkUrl"
                    type="text"
                    value={adData.linkUrl}
                    onChange={(e) => setAdData({ ...adData, linkUrl: e.target.value })}
                    placeholder="example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="callToAction">Call to Action</Label>
                  <Input
                    id="callToAction"
                    value={adData.callToAction}
                    onChange={(e) => setAdData({ ...adData, callToAction: e.target.value })}
                    placeholder="Learn More"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Upload Image</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Label
                      htmlFor="image"
                      className="flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-4 py-2 hover:bg-accent"
                    >
                      <Upload className="h-4 w-4" />
                      Choose Image
                    </Label>
                    {imageFile && (
                      <span className="text-sm text-muted-foreground">{imageFile.name}</span>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={createAdProof.isPending}>
                  {createAdProof.isPending ? "Creating..." : "Create Ad Proof"}
                </Button>
              </form>
            </Card>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Live Preview</h3>
              <div className="flex justify-center">
                {platform === "facebook" && format === "single_image" && (
                  <FacebookSingleImagePreview
                    primaryText={adData.primaryText}
                    imageUrl={imagePreview}
                    headline={adData.headline}
                    description={adData.description}
                    linkUrl={adData.linkUrl}
                    callToAction={adData.callToAction}
                    clientName={campaignData?.clients?.name}
                    clientLogoUrl={campaignData?.clients?.logo_url}
                  />
                )}
                {platform === "facebook" && format === "story" && (
                  <FacebookStoryPreview
                    primaryText={adData.primaryText}
                    imageUrl={imagePreview}
                    headline={adData.headline}
                    description={adData.description}
                    callToAction={adData.callToAction}
                    clientName={campaignData?.clients?.name}
                    clientLogoUrl={campaignData?.clients?.logo_url}
                  />
                )}
                {platform === "instagram" && format === "single_image" && (
                  <InstagramSingleImagePreview
                    primaryText={adData.primaryText}
                    imageUrl={imagePreview}
                    headline={adData.headline}
                    description={adData.description}
                    callToAction={adData.callToAction}
                    clientName={campaignData?.clients?.name}
                    clientLogoUrl={campaignData?.clients?.logo_url}
                  />
                )}
                {platform === "instagram" && format === "story" && (
                  <FacebookStoryPreview
                    primaryText={adData.primaryText}
                    imageUrl={imagePreview}
                    headline={adData.headline}
                    description={adData.description}
                    callToAction={adData.callToAction}
                    clientName={campaignData?.clients?.name}
                    clientLogoUrl={campaignData?.clients?.logo_url}
                  />
                )}
                {platform === "linkedin" && format === "single_image" && (
                  <LinkedInSingleImagePreview
                    primaryText={adData.primaryText}
                    imageUrl={imagePreview}
                    headline={adData.headline}
                    description={adData.description}
                    linkUrl={adData.linkUrl}
                    callToAction={adData.callToAction}
                    clientName={campaignData?.clients?.name}
                    clientLogoUrl={campaignData?.clients?.logo_url}
                  />
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdBuilder;
