import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import { useState } from "react";

interface CarouselCard {
  imageUrl?: string;
  headline?: string;
  description?: string;
  callToAction?: string;
}

interface InstagramCarouselPreviewProps {
  primaryText?: string;
  cards?: CarouselCard[];
  clientName?: string;
  clientLogoUrl?: string;
}

export const InstagramCarouselPreview = ({
  primaryText,
  cards = [
    { imageUrl: "", headline: "Card 1 Headline", description: "Card 1 description", callToAction: "Learn More" },
    { imageUrl: "", headline: "Card 2 Headline", description: "Card 2 description", callToAction: "Learn More" },
    { imageUrl: "", headline: "Card 3 Headline", description: "Card 3 description", callToAction: "Learn More" },
  ],
  clientName = "Your Brand",
  clientLogoUrl,
}: InstagramCarouselPreviewProps) => {
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

      {/* Carousel Image */}
      <div 
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentCard * 100}%)` }}
        >
          {cards.map((cardItem, idx) => (
            <div key={idx} className="min-w-full flex-shrink-0">
              {cardItem.imageUrl ? (
                <img src={cardItem.imageUrl} alt={cardItem.headline} className="w-full aspect-square object-cover" />
              ) : (
                <div className="w-full aspect-square bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">Card {idx + 1} Image</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Card Indicators */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {cards.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentCard(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                idx === currentCard ? "bg-white scale-110" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* CTA Button */}
      {card.callToAction && (
        <div className="px-3 pt-3">
          <Button className="w-full bg-[#0095F6] hover:bg-[#0095F6]/90 text-white border-0 font-semibold" size="sm">
            {card.callToAction}
          </Button>
        </div>
      )}

      {/* Engagement Bar */}
      <div className="px-3 py-2 space-y-2">
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
          <p className="text-foreground">
            <span className="font-semibold">{card.headline}</span>
          </p>
          {primaryText && (
            <p className="text-foreground mt-1">
              <span className="font-semibold mr-1">{clientName?.toLowerCase().replace(/\s+/g, '')}</span>
              {primaryText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
