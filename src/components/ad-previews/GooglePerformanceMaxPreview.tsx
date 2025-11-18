import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GooglePerformanceMaxPreviewProps {
  assetGroups?: Array<{
    assetGroupName: string;
    finalUrl: string;
    mobileUrl?: string;
    textAssets: {
      headlines: string[];
      longHeadline: string;
      descriptions: string[];
      businessName: string;
    };
    images: {
      landscape: Array<{ url: string }>;
      square: Array<{ url: string }>;
      portrait: Array<{ url: string }>;
      logos: Array<{ url: string }>;
    };
    videos?: string[];
    cta?: string;
    displayPath?: {
      path1: string;
      path2: string;
    };
  }>;
  clientName?: string;
  clientLogoUrl?: string;
}

export const GooglePerformanceMaxPreview = ({
  assetGroups = [],
  clientName = "Your Brand",
}: GooglePerformanceMaxPreviewProps) => {
  if (assetGroups.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No asset groups configured
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] w-full">
      <div className="space-y-6 p-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">Google Performance Max Campaign</h3>
          <p className="text-sm text-muted-foreground">Asset Groups Preview</p>
        </div>

        {assetGroups.map((group, groupIndex) => (
          <Card key={groupIndex} className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{group.assetGroupName || `Asset Group ${groupIndex + 1}`}</span>
                <Badge variant="outline">Asset Group</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* URLs */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Destination URLs</h4>
                <div className="text-xs space-y-1">
                  <p className="truncate"><span className="font-medium">Final URL:</span> {group.finalUrl}</p>
                  {group.mobileUrl && (
                    <p className="truncate"><span className="font-medium">Mobile URL:</span> {group.mobileUrl}</p>
                  )}
                </div>
              </div>

              {/* Text Assets */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Text Assets</h4>
                
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Business Name</p>
                  <p className="text-sm">{group.textAssets.businessName || clientName}</p>
                </div>

                {group.textAssets.longHeadline && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Long Headline</p>
                    <p className="text-sm">{group.textAssets.longHeadline}</p>
                  </div>
                )}

                {group.textAssets.headlines.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Headlines ({group.textAssets.headlines.length})
                    </p>
                    <div className="space-y-1">
                      {group.textAssets.headlines.map((headline, idx) => (
                        <p key={idx} className="text-sm">{idx + 1}. {headline}</p>
                      ))}
                    </div>
                  </div>
                )}

                {group.textAssets.descriptions.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Descriptions ({group.textAssets.descriptions.length})
                    </p>
                    <div className="space-y-1">
                      {group.textAssets.descriptions.map((desc, idx) => (
                        <p key={idx} className="text-sm">{idx + 1}. {desc}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Images */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Images</h4>

                {group.images.landscape.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Landscape ({group.images.landscape.length})
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {group.images.landscape.slice(0, 4).map((img, idx) => (
                        <img
                          key={idx}
                          src={img.url}
                          alt={`Landscape ${idx + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                      ))}
                    </div>
                    {group.images.landscape.length > 4 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        +{group.images.landscape.length - 4} more
                      </p>
                    )}
                  </div>
                )}

                {group.images.square.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Square ({group.images.square.length})
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {group.images.square.slice(0, 3).map((img, idx) => (
                        <img
                          key={idx}
                          src={img.url}
                          alt={`Square ${idx + 1}`}
                          className="w-full aspect-square object-cover rounded border"
                        />
                      ))}
                    </div>
                    {group.images.square.length > 3 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        +{group.images.square.length - 3} more
                      </p>
                    )}
                  </div>
                )}

                {group.images.portrait.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Portrait ({group.images.portrait.length})
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {group.images.portrait.slice(0, 3).map((img, idx) => (
                        <img
                          key={idx}
                          src={img.url}
                          alt={`Portrait ${idx + 1}`}
                          className="w-full h-32 object-cover rounded border"
                        />
                      ))}
                    </div>
                    {group.images.portrait.length > 3 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        +{group.images.portrait.length - 3} more
                      </p>
                    )}
                  </div>
                )}

                {group.images.logos.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Logos ({group.images.logos.length})
                    </p>
                    <div className="flex gap-2">
                      {group.images.logos.map((img, idx) => (
                        <img
                          key={idx}
                          src={img.url}
                          alt={`Logo ${idx + 1}`}
                          className="w-16 h-16 object-contain rounded border bg-white"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Call to Action */}
              {group.cta && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Call to Action</p>
                  <Badge>{group.cta}</Badge>
                </div>
              )}

              {/* Display Path */}
              {(group.displayPath?.path1 || group.displayPath?.path2) && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Display Path</p>
                  <p className="text-sm">
                    {group.displayPath.path1}
                    {group.displayPath.path2 && ` / ${group.displayPath.path2}`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};
