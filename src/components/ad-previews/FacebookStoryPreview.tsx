import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";

interface FacebookStoryPreviewProps {
  primaryText?: string;
  imageUrl?: string;
  headline?: string;
  description?: string;
  callToAction?: string;
  clientName?: string;
  clientLogoUrl?: string;
}

export const FacebookStoryPreview = ({
  primaryText,
  imageUrl,
  headline,
  description,
  callToAction,
  clientName = "Your Brand",
  clientLogoUrl,
}: FacebookStoryPreviewProps) => {
  return (
    <div className="w-full max-w-[375px] aspect-[9/16] bg-background border border-border rounded-lg overflow-hidden shadow-lg relative">
      {/* Story Header */}
      <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {clientLogoUrl ? (
              <img src={clientLogoUrl} alt={clientName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-semibold text-muted-foreground">L</span>
            )}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm text-white">{clientName}</div>
            <div className="text-xs text-white/80">Sponsored</div>
          </div>
          <div className="text-white text-2xl">×</div>
        </div>
        <div className="mt-2 h-0.5 bg-white/30 rounded-full">
          <div className="h-full w-1/3 bg-white rounded-full"></div>
        </div>
      </div>

      {/* Story Image/Content */}
      {imageUrl ? (
        <img src={imageUrl} alt="Story" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
          <span className="text-muted-foreground">Story Content</span>
        </div>
      )}

      {/* Story Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        {primaryText && (
          <p className="text-white text-sm mb-2 line-clamp-3">{primaryText}</p>
        )}
        {headline && (
          <p className="text-white font-semibold mb-1">{headline}</p>
        )}
        {description && (
          <p className="text-white/80 text-xs mb-3">{description}</p>
        )}
        {callToAction && (
          <Button variant="secondary" size="sm" className="w-full bg-white/90 hover:bg-white text-black">
            <ChevronUp className="mr-2 h-4 w-4" />
            {callToAction}
          </Button>
        )}
      </div>
    </div>
  );
};
