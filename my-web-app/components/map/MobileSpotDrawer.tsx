"use client";

import { useState } from "react";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import { SpotPinData } from "@/components/MapComponent";

interface MobileSpotDrawerProps {
  spot: SpotPinData | null;
  category?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onPhotoClick?: (imgUrl: string) => void;
}

export default function MobileSpotDrawer({
  spot,
  category,
  isOpen,
  onClose,
  onPhotoClick,
}: MobileSpotDrawerProps) {
  // Expansion modes: 'collapsed' | 'half' | 'full'
  const [expandState, setExpandState] = useState<"collapsed" | "half" | "full">(
    "half"
  );
  const [isPhotoGridExpanded, setIsPhotoGridExpanded] = useState(false);

  if (!isOpen) return null;

  const title = spot ? spot.title : `${category || "Animal"} nearby`;
  const images = spot?.images || [];
  const hasMoreThanTwo = images.length > 2;
  const visibleImages = isPhotoGridExpanded ? images : images.slice(0, 2);

  const toggleExpand = () => {
    if (expandState === "collapsed") setExpandState("half");
    else if (expandState === "half") setExpandState("full");
    else setExpandState("collapsed");
  };

  return (
    <div
      className={`fixed left-0 right-0 z-40 bg-card rounded-t-3xl border-t border-border shadow-2xl transition-all duration-300 md:hidden flex flex-col ${
        expandState === "collapsed"
          ? "bottom-20 max-h-20 p-3.5"
          : expandState === "half"
          ? "bottom-20 max-h-[52vh] p-4"
          : "bottom-0 max-h-[88vh] p-5 pb-8"
      }`}
    >
      {/* Drag handle pill at the top */}
      <button
        type="button"
        onClick={toggleExpand}
        className="w-12 h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50 rounded-full mx-auto mb-2.5 transition-colors cursor-pointer"
        aria-label="Toggle height"
      />

      {/* Header Row: Title + Close Button */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={toggleExpand}>
          <h3 className="font-bold text-base text-foreground truncate">{title}</h3>
          <span className="text-muted-foreground">
            {expandState === "collapsed" ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Detailed content when expanded to half or full */}
      {expandState !== "collapsed" && (
        <div className="mt-3 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-1">
          {spot ? (
            <>
              {/* Creator info */}
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  {spot.author.avatar || spot.author.name.charAt(0)}
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {spot.author.name}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-foreground/80 leading-relaxed">
                {spot.description}
              </p>

              {/* Images Grid */}
              {images.length > 0 && (
                <div className="flex flex-col gap-2 mt-1">
                  <div
                    className={`grid grid-cols-2 gap-2 transition-all duration-300 ${
                      isPhotoGridExpanded ? "max-h-64 overflow-y-auto pr-1 custom-scrollbar" : ""
                    }`}
                  >
                    {visibleImages.map((imgUrl, idx) => {
                      const isSecond = idx === 1;
                      const showMoreOverlay =
                        !isPhotoGridExpanded && isSecond && hasMoreThanTwo;

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (showMoreOverlay) {
                              setIsPhotoGridExpanded(true);
                            } else {
                              onPhotoClick?.(imgUrl);
                            }
                          }}
                          className="aspect-[4/5] rounded-xl overflow-hidden bg-muted relative group cursor-pointer"
                        >
                          <img
                            src={imgUrl}
                            alt={`spot-img-${idx}`}
                            className="w-full h-full object-cover"
                          />

                          {showMoreOverlay && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-white">
                              <span className="text-base font-bold">
                                +{images.length - 2}
                              </span>
                              <span className="text-[10px] uppercase font-medium">
                                More
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Collapse / Expand toggle button */}
                  {hasMoreThanTwo && (
                    <button
                      type="button"
                      onClick={() => setIsPhotoGridExpanded(!isPhotoGridExpanded)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-muted/60 hover:bg-muted text-xs font-medium text-foreground transition-all cursor-pointer"
                    >
                      <span>
                        {isPhotoGridExpanded
                          ? "Collapse photos"
                          : `View all ${images.length} photos`}
                      </span>
                      <ChevronDown
                        className={`size-3.5 transition-transform duration-200 ${
                          isPhotoGridExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="py-4 text-center text-xs text-muted-foreground">
              Select an animal pin on the map to view detailed spots!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
