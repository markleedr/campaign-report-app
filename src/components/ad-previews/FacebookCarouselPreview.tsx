import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";

interface CarouselCard {
  imageUrl?: string;
  headline?: string;
  description?: string;
  callToAction?: string;
}

interface FacebookCarouselPreviewProps {
  primaryText?: string;
  cards?: CarouselCard[];
  clientName?: string;
  clientLogoUrl?: string;
}

export const FacebookCarouselPreview = ({
  primaryText,
  cards = [
    { imageUrl: "", headline: "Card 1 Headline", description: "Card 1 description", callToAction: "Learn More" },
    { imageUrl: "", headline: "Card 2 Headline", description: "Card 2 description", callToAction: "Learn More" },
    { imageUrl: "", headline: "Card 3 Headline", description: "Card 3 description", callToAction: "Learn More" },
  ],
  clientName = "Your Brand",
  clientLogoUrl,
}: FacebookCarouselPreviewProps) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentCard < cards.length - 1) {
      nextCard();
    }
    if (isRightSwipe && currentCard > 0) {
      prevCard();
    }
  };

  const card = cards[currentCard];

  return (
    <div className="w-full max-w-[500px] bg-background border border-border rounded-lg overflow-hidden shadow-sm">
      {/* Profile Header */}
      <div className="p-3 flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {clientLogoUrl ? (
            <img src={clientLogoUrl} alt={clientName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-muted-foreground">L</span>
          )}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-foreground">{clientName}</div>
          <div className="text-xs text-muted-foreground">Sponsored · 🌎</div>
        </div>
        <div className="text-muted-foreground text-xl">⋯</div>
      </div>

      {/* Primary Text */}
      {primaryText && (
        <div className="px-3 pb-2">
          <p className="text-sm text-foreground">{primaryText}</p>
        </div>
      )}

      {/* Carousel Container - Side by side cards */}
      <div className="relative bg-background">
        <div 
          className="flex gap-2 p-2 overflow-x-auto scrollbar-hide"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {cards.map((cardItem, idx) => (
            <div 
              key={idx} 
              className={`flex-shrink-0 bg-background border border-border rounded-lg overflow-hidden cursor-pointer ${
                idx === 0 ? 'w-[280px]' : 'w-[180px]'
              }`}
              onClick={() => setCurrentCard(idx)}
            >
              {/* Card Image */}
              {cardItem.imageUrl ? (
                <img 
                  src={cardItem.imageUrl} 
                  alt={cardItem.headline} 
                  className="w-full aspect-square object-cover" 
                />
              ) : (
                <div className="w-full aspect-square bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Card {idx + 1}</span>
                </div>
              )}
              
              {/* Card Info */}
              <div className="p-2 bg-muted/20">
                <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-1">
                  {cardItem.headline || `Card ${idx + 1} Headline`}
                </h3>
                {idx === 0 && cardItem.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {cardItem.description}
                  </p>
                )}
                {cardItem.callToAction && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs h-7 bg-background hover:bg-accent mt-2"
                  >
                    {cardItem.callToAction}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Bar */}
      <div className="px-3 py-2 border-t border-border">
        <div className="flex items-center text-muted-foreground text-xs mb-2">
          <span>👍❤️ 0</span>
        </div>
        <div className="flex items-center justify-around border-t border-border pt-1">
          <button className="flex items-center gap-1 py-1 px-3 hover:bg-muted/50 rounded text-muted-foreground text-sm">
            <ThumbsUp className="w-4 h-4" />
            Like
          </button>
          <button className="flex items-center gap-1 py-1 px-3 hover:bg-muted/50 rounded text-muted-foreground text-sm">
            <MessageCircle className="w-4 h-4" />
            Comment
          </button>
          <button className="flex items-center gap-1 py-1 px-3 hover:bg-muted/50 rounded text-muted-foreground text-sm">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
};
