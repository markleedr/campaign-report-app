import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageCircle, Repeat2, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface CarouselCard {
  imageUrl?: string;
  headline?: string;
  description?: string;
  callToAction?: string;
}

interface LinkedInCarouselPreviewProps {
  primaryText?: string;
  cards?: CarouselCard[];
  clientName?: string;
  clientLogoUrl?: string;
}

export const LinkedInCarouselPreview = ({
  primaryText,
  cards = [
    { imageUrl: "", headline: "Card 1 Headline", description: "Card 1 description", callToAction: "Learn More" },
    { imageUrl: "", headline: "Card 2 Headline", description: "Card 2 description", callToAction: "Learn More" },
    { imageUrl: "", headline: "Card 3 Headline", description: "Card 3 description", callToAction: "Learn More" },
  ],
  clientName = "Your Brand",
  clientLogoUrl,
}: LinkedInCarouselPreviewProps) => {
  const [currentCard, setCurrentCard] = useState(0);

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const card = cards[currentCard];

  return (
    <div className="w-full max-w-[550px] bg-background border border-border rounded-lg overflow-hidden shadow-sm">
      {/* Profile Header */}
      <div className="p-3 flex items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {clientLogoUrl ? (
            <img src={clientLogoUrl} alt={clientName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-muted-foreground">L</span>
          )}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-foreground">{clientName}</div>
          <div className="text-xs text-muted-foreground">Promoted</div>
        </div>
        <div className="text-muted-foreground text-xl">⋯</div>
      </div>

      {/* Primary Text */}
      {primaryText && (
        <div className="px-3 pb-2">
          <p className="text-sm text-foreground">{primaryText}</p>
        </div>
      )}

      {/* Carousel Card */}
      <div className="relative group">
        {card.imageUrl ? (
          <img src={card.imageUrl} alt={card.headline} className="w-full aspect-square object-cover" />
        ) : (
          <div className="w-full aspect-square bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">Card {currentCard + 1} Image</span>
          </div>
        )}

        {/* Navigation Buttons */}
        {currentCard > 0 && (
          <button
            onClick={prevCard}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
        )}
        {currentCard < cards.length - 1 && (
          <button
            onClick={nextCard}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
        )}

        {/* Card Indicators */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {cards.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx === currentCard ? "w-8 bg-white" : "w-2 bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3 bg-muted/20">
        <div className="text-xs text-muted-foreground mb-1">example.com</div>
        <h3 className="font-semibold text-foreground mb-1 line-clamp-2">{card.headline}</h3>
        {card.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{card.description}</p>
        )}
        {card.callToAction && (
          <Button variant="outline" className="w-full mt-3 border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2]/5 font-semibold">
            {card.callToAction}
          </Button>
        )}
      </div>

      {/* Engagement Bar */}
      <div className="px-3 py-2 border-t border-border">
        <div className="flex items-center text-muted-foreground text-xs mb-2">
          <span>👍 0 · 0 comments</span>
        </div>
        <div className="flex items-center justify-around">
          <button className="flex items-center gap-2 py-2 px-3 hover:bg-muted/50 rounded text-muted-foreground text-sm">
            <ThumbsUp className="w-5 h-5" />
            Like
          </button>
          <button className="flex items-center gap-2 py-2 px-3 hover:bg-muted/50 rounded text-muted-foreground text-sm">
            <MessageCircle className="w-5 h-5" />
            Comment
          </button>
          <button className="flex items-center gap-2 py-2 px-3 hover:bg-muted/50 rounded text-muted-foreground text-sm">
            <Repeat2 className="w-5 h-5" />
            Repost
          </button>
          <button className="flex items-center gap-2 py-2 px-3 hover:bg-muted/50 rounded text-muted-foreground text-sm">
            <Send className="w-5 h-5" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
