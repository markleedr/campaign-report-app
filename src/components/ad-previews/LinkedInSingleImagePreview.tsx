import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageCircle, Share2, Send } from "lucide-react";

interface LinkedInSingleImagePreviewProps {
  primaryText?: string;
  imageUrl?: string;
  headline?: string;
  description?: string;
  linkUrl?: string;
  callToAction?: string;
  clientName?: string;
  clientLogoUrl?: string;
}

export const LinkedInSingleImagePreview = ({
  primaryText,
  imageUrl,
  headline,
  description,
  linkUrl,
  callToAction,
  clientName = "Your Brand",
  clientLogoUrl,
}: LinkedInSingleImagePreviewProps) => {
  return (
    <div className="w-full max-w-[550px] bg-background border border-border rounded-lg overflow-hidden shadow-sm">
      {/* Profile Header */}
      <div className="p-4 flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
          {clientLogoUrl ? (
            <img src={clientLogoUrl} alt={clientName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-muted-foreground">
              {clientName?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'YB'}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground">{clientName}</div>
          <div className="text-xs text-muted-foreground">58,360 followers</div>
          <div className="text-xs text-muted-foreground">Promoted</div>
        </div>
        <div className="text-foreground text-xl">⋯</div>
      </div>

      {/* Primary Text */}
      {primaryText && (
        <div className="px-4 pb-3">
          <p className="text-sm text-foreground whitespace-pre-wrap">{primaryText}</p>
        </div>
      )}

      {/* Ad Image */}
      {imageUrl ? (
        <img src={imageUrl} alt="Ad" className="w-full object-cover" />
      ) : (
        <div className="w-full aspect-video bg-muted flex items-center justify-center">
          <span className="text-muted-foreground">Ad Image</span>
        </div>
      )}

      {/* Ad Content Card */}
      {(headline || description) && (
        <div className="border-t border-border bg-card p-3">
          {headline && (
            <div className="font-semibold text-sm text-foreground mb-1">{headline}</div>
          )}
          {description && (
            <div className="text-sm text-muted-foreground">{description}</div>
          )}
        </div>
      )}

      {/* CTA Button */}
      {callToAction && (
        <div className="px-4 pb-3">
          <Button variant="outline" size="sm" className="w-full">
            {callToAction}
          </Button>
        </div>
      )}

      {/* Engagement Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border">
        <span>88 · 4 Comments</span>
      </div>

      {/* Engagement Bar */}
      <div className="border-t border-border p-1 flex items-center justify-around">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm py-2 px-3 rounded hover:bg-muted">
          <ThumbsUp className="w-4 h-4" />
          Like
        </button>
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm py-2 px-3 rounded hover:bg-muted">
          <MessageCircle className="w-4 h-4" />
          Comment
        </button>
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm py-2 px-3 rounded hover:bg-muted">
          <Share2 className="w-4 h-4" />
          Share
        </button>
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm py-2 px-3 rounded hover:bg-muted">
          <Send className="w-4 h-4" />
          Send
        </button>
      </div>
    </div>
  );
};
