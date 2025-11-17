import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";

interface InstagramSingleImagePreviewProps {
  primaryText?: string;
  imageUrl?: string;
  headline?: string;
  description?: string;
  callToAction?: string;
  clientName?: string;
  clientLogoUrl?: string;
}

export const InstagramSingleImagePreview = ({
  primaryText,
  imageUrl,
  headline,
  description,
  callToAction,
  clientName = "Your Brand",
  clientLogoUrl,
}: InstagramSingleImagePreviewProps) => {
  return (
    <div className="w-full max-w-[500px] bg-background border border-border rounded-sm overflow-hidden shadow-sm">
      {/* Profile Header */}
      <div className="p-3 flex items-center gap-2 border-b border-border">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
          <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
            {clientLogoUrl ? (
              <img src={clientLogoUrl} alt={clientName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-semibold text-muted-foreground">L</span>
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-foreground">{clientName?.toLowerCase().replace(/\s+/g, '')}</div>
          <div className="text-xs text-muted-foreground">Sponsored</div>
        </div>
        <div className="text-foreground">⋯</div>
      </div>

      {/* Ad Image */}
      {imageUrl ? (
        <img src={imageUrl} alt="Ad" className="w-full aspect-square object-cover" />
      ) : (
        <div className="w-full aspect-square bg-muted flex items-center justify-center">
          <span className="text-muted-foreground">Ad Image</span>
        </div>
      )}

      {/* Engagement Bar */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Heart className="w-6 h-6 text-foreground" />
            <MessageCircle className="w-6 h-6 text-foreground" />
            <Send className="w-6 h-6 text-foreground" />
          </div>
          <Bookmark className="w-6 h-6 text-foreground" />
        </div>

        {/* Caption */}
        <div className="text-sm">
          {primaryText && (
            <p className="text-foreground">
              <span className="font-semibold mr-1">{clientName?.toLowerCase().replace(/\s+/g, '')}</span>
              {primaryText}
            </p>
          )}
          {headline && (
            <p className="text-foreground font-semibold mt-1">{headline}</p>
          )}
          {description && (
            <p className="text-muted-foreground text-xs mt-1">{description}</p>
          )}
        </div>

        {/* CTA Button */}
        {callToAction && (
          <Button variant="outline" size="sm" className="w-full mt-2">
            {callToAction}
          </Button>
        )}
      </div>
    </div>
  );
};
