"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { SpotPinData } from "@/components/MapComponent";

interface MobileSpotDrawerProps {
  spot: SpotPinData | null;
  category?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onPhotoClick?: (imgUrl: string, index?: number) => void;
}

export default function MobileSpotDrawer({
  spot,
  category,
  isOpen,
  onClose,
  onPhotoClick,
}: MobileSpotDrawerProps) {
  // 3 Distinct Snap Levels as designed in Figma:
  // 1. "collapsed" (ค่าเริ่มต้น) = ~68px: Handle bar + Title + Close 'X'
  // 2. "peek" (ปัดขึ้น 30%) = ~320px: Header + Author + Description + Photo tops peeking
  // 3. "full" (ยืดสุด 100%) = Max height above bottom nav: Full photo cards side-by-side
  const [expandState, setExpandState] = useState<"collapsed" | "peek" | "full">(
    "collapsed"
  );

  // When a new spot is selected, reset to default ("collapsed")
  useEffect(() => {
    if (isOpen) {
      setExpandState("collapsed");
    }
  }, [spot?.id, isOpen]);

  // Touch drag swipe gestures support
  const touchStartY = useRef<number | null>(null);
  const touchCurrentY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (touchStartY.current === null || touchCurrentY.current === null) return;
    const diff = touchStartY.current - touchCurrentY.current; // >0 is swipe up, <0 is swipe down
    const threshold = 35;

    if (diff > threshold) {
      // Swipe UP
      setExpandState((prev) => {
        if (prev === "collapsed") return "peek";
        if (prev === "peek") return "full";
        return "full";
      });
    } else if (diff < -threshold) {
      // Swipe DOWN
      setExpandState((prev) => {
        if (prev === "full") return "peek";
        if (prev === "peek") return "collapsed";
        // Swiping down from collapsed closes drawer
        onClose();
        return "collapsed";
      });
    }

    touchStartY.current = null;
    touchCurrentY.current = null;
  };

  const toggleExpand = () => {
    setExpandState((prev) => {
      if (prev === "collapsed") return "peek";
      if (prev === "peek") return "full";
      return "collapsed";
    });
  };

  if (!isOpen) return null;

  const title = spot ? spot.title : `${category || "Animal"} nearby`;
  const images = spot?.images || [];

  return (
    <div
      className={`fixed left-0 right-0 z-40 bg-card rounded-t-3xl border-t border-border shadow-2xl transition-all duration-300 ease-out md:hidden flex flex-col bottom-[72px] overflow-hidden ${
        expandState === "collapsed"
          ? "h-[68px] px-5 pt-2 pb-3"
          : expandState === "peek"
          ? "h-[320px] px-5 pt-2 pb-4"
          : "h-[calc(100dvh-72px-32px)] px-5 pt-2 pb-4"
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. Drag handle pill at top */}
      <div
        onClick={toggleExpand}
        className="w-full flex justify-center py-1 cursor-pointer select-none shrink-0"
      >
        <div className="w-12 h-1 bg-muted-foreground/30 hover:bg-muted-foreground/50 rounded-full transition-colors" />
      </div>

      {/* 2. Header Row: Title + Close Button */}
      <div className="flex items-center justify-between gap-2 shrink-0 pt-0.5 pb-2">
        <div
          className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
          onClick={toggleExpand}
        >
          <h3 className="font-bold text-base text-foreground truncate">
            {title}
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors cursor-pointer shrink-0"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* 3. Detailed content for "peek" (30%) and "full" (100%) states */}
      {expandState !== "collapsed" && (
        <div
          className={`flex-1 flex flex-col gap-3 min-h-0 ${
            expandState === "full"
              ? "overflow-y-auto custom-scrollbar pr-1 pb-4"
              : "overflow-hidden"
          }`}
        >
          {/* Creator / Author row */}
          {spot && (
            <div className="flex items-center gap-2 shrink-0">
              <div className="size-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold border border-orange-200">
                {spot.author.avatar || spot.author.name.charAt(0)}
              </div>
              <span className="text-xs font-semibold text-foreground">
                {spot.author.name}
              </span>
            </div>
          )}

          {/* Description */}
          {spot?.description && (
            <p className="text-xs text-muted-foreground leading-relaxed shrink-0 line-clamp-3">
              {spot.description}
            </p>
          )}

          {/* Photo Cards (2-Column Grid matching Figma design) */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => onPhotoClick?.(imgUrl, idx)}
                  className="aspect-[3/4] rounded-2xl overflow-hidden bg-muted cursor-pointer shadow-sm relative group shrink-0"
                >
                  <img
                    src={imgUrl}
                    alt={`spot-img-${idx}`}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
