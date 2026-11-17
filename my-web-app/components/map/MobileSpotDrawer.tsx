"use client";

import { useState, useRef, useEffect } from "react";
import { X, MapPin } from "lucide-react";
import { SpotPinData } from "@/components/MapComponent";
import AnimalIcon from "@/components/spotModal/AnimalIcon";

interface MobileSpotDrawerProps {
  spot: (SpotPinData & {
    timeAgo?: string;
    author?: SpotPinData["author"] & { role?: string };
  }) | null;
  category?: string | null;
  animalPinMap?: Record<string, string>;
  isOpen: boolean;
  onClose: () => void;
  onPhotoClick?: (imgUrl: string, index?: number) => void;
}

export default function MobileSpotDrawer({
  spot,
  category,
  animalPinMap,
  isOpen,
  onClose,
  onPhotoClick,
}: MobileSpotDrawerProps) {
  const [expandState, setExpandState] = useState<"collapsed" | "peek" | "full">(
    "collapsed"
  );

  useEffect(() => {
    if (isOpen) {
      setExpandState("collapsed");
    }
  }, [spot?.id, isOpen]);

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
    const diff = touchStartY.current - touchCurrentY.current;
    const threshold = 35;

    if (diff > threshold) {
      setExpandState((prev) => {
        if (prev === "collapsed") return "peek";
        if (prev === "peek") return "full";
        return "full";
      });
    } else if (diff < -threshold) {
      setExpandState((prev) => {
        if (prev === "full") return "peek";
        if (prev === "peek") return "collapsed";
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
  const categories = spot?.category
    ? Array.isArray(spot.category)
      ? spot.category
      : [spot.category]
    : category
    ? [category]
    : [];

  return (
    <div
      className={`fixed left-0 right-0 z-40 bg-card rounded-t-3xl border-t border-border shadow-2xl transition-all duration-300 ease-out md:hidden flex flex-col bottom-[72px] overflow-hidden ${
        expandState === "collapsed"
          ? "h-[68px] px-5 pt-2 pb-3"
          : expandState === "peek"
          ? "h-[380px] px-5 pt-2 pb-4"
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

      {/* 3. Detailed content for "peek" and "full" states */}
      {expandState !== "collapsed" && (
        <div
          className={`flex-1 flex flex-col gap-3 min-h-0 ${
            expandState === "full"
              ? "overflow-y-auto custom-scrollbar pr-1 pb-4"
              : "overflow-hidden"
          }`}
        >
          {/* Full-width Top Border Row: Author (Left) + Animal Badges (Right) */}
          {(spot || categories.length > 0) && (
            <div className="w-full pt-2.5 border-t border-border/60 flex items-center justify-between gap-2 shrink-0">
              {/* Left: Author */}
              {spot ? (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="size-7 rounded-full bg-amber-100/80 text-amber-800 flex items-center justify-center text-xs font-semibold border border-amber-200/80 shrink-0 uppercase">
                    {spot.author?.avatar || spot.author?.name?.charAt(0) || "A"}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 text-xs leading-tight">
                      <span className="font-semibold text-foreground truncate">
                        {spot.author?.name || "Spotter"}
                      </span>
                      {spot.timeAgo && (
                        <>
                          <span className="text-muted-foreground/60">•</span>
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            {spot.timeAgo}
                          </span>
                        </>
                      )}
                    </div>
                    {spot.author?.role && (
                      <span className="text-[11px] text-muted-foreground truncate leading-tight">
                        {spot.author.role}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div />
              )}
            </div>
          )}
        {/* Animal Badge Tags */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              {categories.map((animalName) => {
                const key = animalName.toLowerCase();
                const pin =
                  animalPinMap?.[key] ||
                  spot?.pinName ||
                  "ph:paw-print-fill";
                return (
                  <span
                    key={animalName}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground text-[11px] font-semibold uppercase tracking-wide"
                  >
                    <AnimalIcon pinName={pin} className="size-3.5" />
                    {animalName}
                  </span>
                );
              })}
            </div>
          )}

          {/* Location */}
          {spot?.address && (
            <div
              className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0 shrink-0"
              title={spot.address}
            >
              <MapPin className="size-3.5 shrink-0 text-primary" />
              <span className="truncate">{spot.address}</span>
            </div>
          )}

          {/* Description */}
          {spot?.description && (
            <p className="text-sm font-medium text-muted-foreground leading-relaxed shrink-0 line-clamp-3">
              {spot.description}
            </p>
          )}

          {/* Photo Cards (2-Column Grid) */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 pt-0.5">
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