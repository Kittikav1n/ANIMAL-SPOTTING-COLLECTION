"use client";

import { useState } from "react";
import { X, ChevronDown } from "lucide-react";

export interface SpotCardData {
  id?: string | number;
  title: string;
  address?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  timeAgo?: string;
  description?: string;
  images?: string[];
  photoUrl?: string;
}

interface SpotCardProps {
  data?: SpotCardData | null;
  onClose?: () => void;
  onPhotoClick?: (imgUrl: string, index?: number) => void;
  activePhotoIndex?: number;
}

export default function SpotCard({
  data,
  onClose,
  onPhotoClick,
  activePhotoIndex,
}: SpotCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data) return null;

  const images = data.images || [];
  const hasMoreThanTwo = images.length > 2;
  const visibleImages = isExpanded ? images : images.slice(0, 2);

  const authorName = data.author?.name || "Spotter";
  const authorAvatar = data.author?.avatar;

  return (
    <div className="w-[340px] lg:w-[360px] h-fit max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar bg-card/95 backdrop-blur-md text-foreground rounded-3xl shadow-2xl border border-border/80 p-5 transition-all flex flex-col justify-between">
      {/* Upper Content */}
      <div className="flex flex-col min-h-0">
        {/* Header: Title + Close Button */}
        <div className="flex items-start justify-between gap-2 shrink-0">
          <h3 className="font-bold text-base text-foreground leading-snug">
            {data.title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors -mr-1 -mt-1 cursor-pointer"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Author Row + Location + Time */}
        <div className="flex items-center gap-1.5 mt-1.5 mb-2.5 text-xs text-muted-foreground font-medium shrink-0">
          <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold overflow-hidden shrink-0">
            {authorAvatar ? (
              <span>{authorAvatar}</span>
            ) : (
              authorName.charAt(0).toUpperCase()
            )}
          </div>
          <span className="truncate">{authorName}</span>
          {data.address && (
            <>
              <span>•</span>
              <span className="truncate">{data.address}</span>
            </>
          )}
          {data.timeAgo && (
            <>
              <span>•</span>
              <span className="shrink-0">{data.timeAgo}</span>
            </>
          )}
        </div>

        {/* Description */}
        {data.description && (
          <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3 mb-3 shrink-0">
            {data.description}
          </p>
        )}

        {/* Main Images Grid (2 Columns) */}
        {images.length > 0 && (
          <div className="flex flex-col gap-2 min-h-0 flex-1">
            <div
              className={`grid grid-cols-2 gap-3 transition-all duration-300 ${
                isExpanded ? "h-auto" : "h-[200px]"
              }`}
            >
              {visibleImages.map((imgUrl, idx) => {
                if (!imgUrl) return null;
                const isSecondImage = idx === 1;
                const remainingCount = images.length - 2;
                const showOverlay =
                  !isExpanded && isSecondImage && hasMoreThanTwo;
                const isSelected = activePhotoIndex === idx;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (showOverlay) {
                        setIsExpanded(true);
                      } else {
                        onPhotoClick?.(imgUrl, idx);
                      }
                    }}
                    className={`aspect-[4/5] rounded-2xl overflow-hidden bg-muted relative group cursor-pointer shadow-sm transition-all duration-200 ${
                      isSelected
                        ? "ring-2 ring-primary ring-offset-2 scale-[1.02]"
                        : "hover:opacity-90"
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`spot-img-${idx}`}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />

                    {/* +N More Overlay on 2nd photo */}
                    {showOverlay && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-white transition-opacity hover:bg-black/70">
                        <span className="text-sm font-bold">
                          +{remainingCount}
                        </span>
                        <span className="text-[10px] font-medium tracking-wide">
                          More
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* View All Button */}
      {hasMoreThanTwo && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-muted/60 hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer shrink-0"
        >
          <span>
            {isExpanded ? "Collapse photos" : `View all ${images.length} photos`}
          </span>
          <ChevronDown
            className={`size-3.5 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      )}
    </div>
  );
}