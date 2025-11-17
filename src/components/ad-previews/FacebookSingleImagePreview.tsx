import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageCircle, Share2 } from "lucide-react";

interface FacebookSingleImagePreviewProps {
  primaryText?: string;
  imageUrl?: string;
  headline?: string;
  description?: string;
  linkUrl?: string;
  callToAction?: string;
  clientName?: string;
  clientLogoUrl?: string;
}

export const FacebookSingleImagePreview = ({
  primaryText,
  imageUrl,
  headline,
  description,
  linkUrl,
  callToAction,
  clientName = "Your Brand",
  clientLogoUrl,
}: FacebookSingleImagePreviewProps) => {
  return (
    <div className="w-full max-w-[500px] bg-background border border-border rounded-lg overflow-hidden shadow-sm">
      {/* Profile Header */}
      <div className="p-3 flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {clientLogoUrl ? (
            <img src={clientLogoUrl} alt={clientName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-semibold text-muted-foreground">LOGO</span>
          )}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-foreground">{clientName}</div>
          <div className="text-xs text-muted-foreground">Sponsored</div>
        </div>
      </div>

      {/* Primary Text */}
      {primaryText && (
        <div className="px-3 pb-3">
          <p className="text-sm text-foreground">{primaryText}</p>
        </div>
      )}

      {/* Ad Image */}
      {imageUrl ? (
        <img src={imageUrl} alt="Ad" className="w-full object-cover" />
      ) : (
        <div className="w-full aspect-square bg-muted flex items-center justify-center">
          <span className="text-muted-foreground">Ad Image</span>
        </div>
      )}

      {/* Ad Content Card */}
      {(headline || description || linkUrl) && (
        <div className="border-t border-border bg-card p-3">
          {linkUrl && (
            <div className="text-xs text-muted-foreground uppercase mb-1">{linkUrl}</div>
          )}
          {headline && (
            <div className="font-semibold text-foreground mb-1">{headline}</div>
          )}
          {description && (
            <div className="text-sm text-muted-foreground">{description}</div>
          )}
        </div>
      )}

      {/* CTA Button */}
      {callToAction && (
        <div className="px-3 pb-3">
          <Button variant="secondary" size="sm" className="w-full">
            {callToAction}
          </Button>
        </div>
      )}

      {/* Engagement Bar */}
      <div className="border-t border-border p-2 flex items-center justify-around">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm">
          <ThumbsUp className="w-4 h-4" />
          Like
        </button>
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm">
          <MessageCircle className="w-4 h-4" />
          Comment
        </button>
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm">
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  );
};
