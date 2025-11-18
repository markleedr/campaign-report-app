import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { FacebookCarouselPreview } from "@/components/ad-previews/FacebookCarouselPreview";
import { InstagramCarouselPreview } from "@/components/ad-previews/InstagramCarouselPreview";
import { LinkedInCarouselPreview } from "@/components/ad-previews/LinkedInCarouselPreview";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CarouselCardData {
  imageFile: File | null;
  imagePreview: string;
  headline: string;
  description: string;
  url: string;
}

const CarouselBuilder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const platform = searchParams.get("platform");
  const adProofId = searchParams.get("adProofId");
  const queryClient = useQueryClient();
  const isEditMode = !!adProofId;

  const [adData, setAdData] = useState({
    name: "",
    primaryText: "",
    linkUrl: "",
    callToAction: "Learn More",
  });

  const [cards, setCards] = useState<CarouselCardData[]>([
    { imageFile: null, imagePreview: "", headline: "", description: "", url: "" },
    { imageFile: null, imagePreview: "", headline: "", description: "", url: "" },
    { imageFile: null, imagePreview: "", headline: "", description: "", url: "" },
  ]);

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

  // Fetch existing ad proof data if editing
  const { data: existingAdProof } = useQuery({
    queryKey: ["ad-proof", adProofId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_proofs")
        .select("*")
        .eq("id", adProofId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEditMode,
  });

  const { data: existingVersion } = useQuery({
    queryKey: ["ad-proof-version", adProofId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_proof_versions")
        .select("*")
        .eq("ad_proof_id", adProofId)
        .order("version_number", { ascending: false })
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEditMode,
  });

  // Load existing data when in edit mode
  useEffect(() => {
    if (existingVersion?.ad_data) {
      const data = existingVersion.ad_data as any;
      setAdData({
        name: data.name || "",
        primaryText: data.primaryText || "",
        linkUrl: data.linkUrl || "",
        callToAction: data.callToAction || "Learn More",
      });
      if (data.cards && Array.isArray(data.cards)) {
        setCards(
          data.cards.map((card: any) => ({
            imageFile: null,
            imagePreview: card.imageUrl || "",
            headline: card.headline || "",
            description: card.description || "",
            url: card.url || "",
          }))
        );
      }
    }
  }, [existingVersion]);

  const handleCardImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newCards = [...cards];
        newCards[index] = {
          ...newCards[index],
          imageFile: file,
          imagePreview: reader.result as string,
        };
        setCards(newCards);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateCardField = (index: number, field: keyof CarouselCardData, value: string) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
  };

  const getMaxCards = () => {
    if (platform === "facebook" || platform === "instagram") return 5;
    if (platform === "linkedin") return 10;
    return 10;
  };

  const addCard = () => {
    if (cards.length < getMaxCards()) {
      setCards([...cards, { imageFile: null, imagePreview: "", headline: "", description: "", url: "" }]);
    }
  };

  const removeCard = (index: number) => {
    if (cards.length > 2) {
      const newCards = cards.filter((_, i) => i !== index);
      setCards(newCards);
    }
  };

  const createAdProof = useMutation({
    mutationFn: async () => {
      if (!campaignId || !platform) {
        throw new Error("Missing campaign information");
      }

      // Generate share token (only for new ad proofs)
      const shareToken = isEditMode
        ? existingAdProof?.share_token
        : Math.random().toString(36).substring(2, 14);

      // Upload all card images
      const uploadedCards = await Promise.all(
        cards.map(async (card, index) => {
          let imageUrl = card.imagePreview; // Use existing preview if no new file
          if (card.imageFile) {
            const fileExt = card.imageFile.name.split(".").pop();
            const filePath = `${campaignId}/${shareToken}-card-${index}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from("ad-media")
              .upload(filePath, card.imageFile, { upsert: true });

            if (uploadError) throw uploadError;

            const {
              data: { publicUrl },
            } = supabase.storage.from("ad-media").getPublicUrl(filePath);

            imageUrl = publicUrl;
          }

          return {
            imageUrl,
            headline: card.headline,
            description: card.description,
            callToAction: adData.callToAction,
          };
        })
      );

      if (isEditMode) {
        // Update existing ad proof
        const nextVersionNumber = (existingAdProof?.current_version || 0) + 1;

        // Update ad proof
        const { error: updateError } = await supabase
          .from("ad_proofs")
          .update({
            current_version: nextVersionNumber,
            updated_at: new Date().toISOString(),
            name: adData.name || null,
          })
          .eq("id", adProofId);

        if (updateError) throw updateError;

        // Create new version with updated ad data
        const { error: versionError } = await supabase.from("ad_proof_versions").insert({
          ad_proof_id: adProofId,
          version_number: nextVersionNumber,
          ad_data: {
            name: adData.name,
            primaryText: adData.primaryText,
            linkUrl: adData.linkUrl,
            callToAction: adData.callToAction,
            cards: uploadedCards,
          },
        });

        if (versionError) throw versionError;

        return existingAdProof;
      } else {
        // Create new ad proof
        const { data: adProof, error: adProofError } = await supabase
          .from("ad_proofs")
          .insert({
            campaign_id: campaignId,
            platform: platform,
            ad_format: "carousel",
            share_token: shareToken,
            status: "pending",
            name: adData.name || null,
          })
          .select()
          .single();

        if (adProofError) throw adProofError;

        // Create version with ad data
        const { error: versionError } = await supabase.from("ad_proof_versions").insert({
          ad_proof_id: adProof.id,
          version_number: 1,
          ad_data: {
            name: adData.name,
            primaryText: adData.primaryText,
            linkUrl: adData.linkUrl,
            callToAction: adData.callToAction,
            cards: uploadedCards,
          },
        });

        if (versionError) throw versionError;

        return adProof;
      }
    },
    onSuccess: (data) => {
      toast.success(isEditMode ? "Carousel ad updated successfully!" : "Carousel ad proof created successfully!");
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["ad-proofs", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["ad-proof", adProofId] });
      navigate(`/campaign/${campaignId}`);
    },
    onError: (error) => {
      console.error("Error creating ad proof:", error);
      toast.error("Failed to create ad proof");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAdProof.mutate();
  };

  const getCharacterLimit = (field: string) => {
    if (platform === "linkedin") {
      if (field === "primaryText") return 600;
      if (field === "headline") return 70;
      if (field === "description") return 100;
    }
    if (platform === "facebook") {
      if (field === "primaryText") return 125;
      if (field === "headline") return 40;
      if (field === "description") return 30;
    }
    if (platform === "instagram") {
      if (field === "primaryText") return 2200;
      if (field === "headline") return 40;
      if (field === "description") return 30;
    }
    return 1000;
  };

  // Prepare preview cards
  const previewCards = cards.map((card) => ({
    imageUrl: card.imagePreview,
    headline: card.headline,
    description: card.description,
    callToAction: adData.callToAction,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(`/campaign/${campaignId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaign
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Input Fields */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold">
                {isEditMode ? "Edit" : "Create"} {platform?.charAt(0).toUpperCase() + platform?.slice(1)} Carousel Ad
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Primary Text */}
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

                {/* Link URL */}
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

                {/* Call to Action */}
                <div className="space-y-2">
                  <Label htmlFor="callToAction">Call to Action</Label>
                  <Select
                    value={adData.callToAction}
                    onValueChange={(value) => setAdData({ ...adData, callToAction: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Shop Now">Shop Now</SelectItem>
                      <SelectItem value="Learn More">Learn More</SelectItem>
                      <SelectItem value="Sign Up">Sign Up</SelectItem>
                      <SelectItem value="Contact Us">Contact Us</SelectItem>
                      <SelectItem value="Book Now">Book Now</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Carousel Cards */}
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label>Carousel Cards ({cards.length}/{getMaxCards()})</Label>
                    {cards.length < getMaxCards() && (
                      <Button type="button" variant="outline" size="sm" onClick={addCard}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Card
                      </Button>
                    )}
                  </div>

                  {cards.map((card, index) => (
                    <Card key={index} className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Card {index + 1}</h4>
                        {cards.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCard(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {/* Card Image Upload */}
                      <div className="space-y-2">
                        <Label htmlFor={`card-image-${index}`}>Image *</Label>
                        <div className="flex items-center gap-4">
                          <Input
                            id={`card-image-${index}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleCardImageUpload(index, e)}
                            className="hidden"
                          />
                          <Label
                            htmlFor={`card-image-${index}`}
                            className="flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-4 py-2 hover:bg-accent"
                          >
                            <Upload className="h-4 w-4" />
                            Choose Image
                          </Label>
                          {card.imageFile && (
                            <span className="text-sm text-muted-foreground">{card.imageFile.name}</span>
                          )}
                        </div>
                        {card.imagePreview && (
                          <img
                            src={card.imagePreview}
                            alt={`Card ${index + 1}`}
                            className="w-32 h-32 object-cover rounded"
                          />
                        )}
                      </div>

                      {/* Card Headline */}
                      <div className="space-y-2">
                        <Label htmlFor={`card-headline-${index}`}>
                          Headline ({card.headline.length}/{getCharacterLimit("headline")})
                        </Label>
                        <Input
                          id={`card-headline-${index}`}
                          value={card.headline}
                          onChange={(e) =>
                            updateCardField(
                              index,
                              "headline",
                              e.target.value.slice(0, getCharacterLimit("headline"))
                            )
                          }
                          placeholder="Enter headline"
                        />
                      </div>

                      {/* Card Description */}
                      <div className="space-y-2">
                        <Label htmlFor={`card-description-${index}`}>
                          Description ({card.description.length}/{getCharacterLimit("description")})
                        </Label>
                        <Textarea
                          id={`card-description-${index}`}
                          value={card.description}
                          onChange={(e) =>
                            updateCardField(
                              index,
                              "description",
                              e.target.value.slice(0, getCharacterLimit("description"))
                            )
                          }
                          placeholder="Enter description"
                          rows={2}
                        />
                      </div>

                      {/* Card URL */}
                      <div className="space-y-2">
                        <Label htmlFor={`card-url-${index}`}>Website URL *</Label>
                        <Input
                          id={`card-url-${index}`}
                          value={card.url}
                          onChange={(e) => updateCardField(index, "url", e.target.value)}
                          placeholder="www.example.com"
                          type="url"
                        />
                      </div>
                    </Card>
                  ))}
                </div>

                <Button type="submit" className="w-full" disabled={createAdProof.isPending}>
                  {createAdProof.isPending 
                    ? (isEditMode ? "Saving..." : "Creating...") 
                    : (isEditMode ? "Save Changes" : "Create Ad Proof")
                  }
                </Button>
              </form>
            </Card>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="space-y-6">
            <Card className="p-6 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-auto">
              <h3 className="mb-4 font-semibold">Live Preview</h3>
              <div className="flex justify-center scale-90 origin-top">
                {platform === "facebook" && (
                  <FacebookCarouselPreview
                    primaryText={adData.primaryText}
                    cards={previewCards}
                    clientName={campaignData?.clients?.name}
                    clientLogoUrl={campaignData?.clients?.logo_url}
                  />
                )}
                {platform === "instagram" && (
                  <InstagramCarouselPreview
                    primaryText={adData.primaryText}
                    cards={previewCards}
                    clientName={campaignData?.clients?.name}
                    clientLogoUrl={campaignData?.clients?.logo_url}
                  />
                )}
                {platform === "linkedin" && (
                  <LinkedInCarouselPreview
                    primaryText={adData.primaryText}
                    cards={previewCards}
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

export default CarouselBuilder;
