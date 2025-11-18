import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareAdProofDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareToken: string;
}

export const ShareAdProofDialog = ({ open, onOpenChange, shareToken }: ShareAdProofDialogProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/proof/${shareToken}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Ad Proof</DialogTitle>
          <DialogDescription>
            Share this link with your client to review and approve the ad proof.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input value={shareUrl} readOnly className="flex-1" />
            <Button onClick={handleCopy} variant="outline" size="icon">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Anyone with this link can view the ad proof and provide feedback.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
