import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddClientDialog({ open, onOpenChange }: AddClientDialogProps) {
  const [clientName, setClientName] = useState("");
  const [clientUrl, setClientUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createClient = useMutation({
    mutationFn: async () => {
      let finalLogoUrl = logoUrl;

      // Upload logo file if provided
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `client-logos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('ad-media')
          .upload(filePath, logoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('ad-media')
          .getPublicUrl(filePath);

        finalLogoUrl = publicUrl;
      } else if (clientUrl && !logoUrl) {
        // Try to fetch logo from URL
        try {
          const url = new URL(clientUrl.startsWith('http') ? clientUrl : `https://${clientUrl}`);
          const domain = url.hostname.replace('www.', '');
          finalLogoUrl = `https://logo.clearbit.com/${domain}`;
        } catch (e) {
          // Invalid URL, continue without logo
        }
      }

      const { data, error } = await supabase
        .from("clients")
        .insert({
          name: clientName,
          logo_url: finalLogoUrl || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Client added",
        description: "The client has been successfully added.",
      });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setClientName("");
      setClientUrl("");
      setLogoUrl("");
      setLogoFile(null);
      setLogoPreview("");
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add client: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a client name",
        variant: "destructive",
      });
      return;
    }
    createClient.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Add a new client to your dashboard. The logo will be automatically fetched from the website.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Company Name</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientUrl">Website URL</Label>
              <Input
                id="clientUrl"
                value={clientUrl}
                onChange={(e) => setClientUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUpload">Upload Logo (Optional)</Label>
              <Input
                id="logoUpload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setLogoFile(file);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setLogoPreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {logoPreview && (
                <div className="mt-2">
                  <img src={logoPreview} alt="Logo preview" className="h-16 w-16 object-contain border rounded" />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                If no logo is uploaded, we'll try to fetch one from the website automatically.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createClient.isPending}>
              {createClient.isPending ? "Adding..." : "Add Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
