"use client";

import { useState } from "react";
import { X, ChevronDown } from "lucide-react";

export interface SpotCardData {
  title: string;
  author: {
    name: string;
    avatar?: string;
  };
  description: string;
  images?: string[];
}

interface SpotCardProps {
  data?: SpotCardData;
  onClose?: () => void;
}

const DEFAULT_SPOT: SpotCardData = {
  title: "Fruit-Loving Cat",
  author: {
    name: "Kingkong1212",
    avatar: "🐱",
  },
  description:
    "A friendly local cat with a quirky habit of resting under apple trees. Known by students for enjoying small fruit treats near the campus walkway.",
  images: [
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&h=400&fit=crop",
  ],
};

export default function SpotCard({
  data = DEFAULT_SPOT,
  onClose,
}: SpotCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const images = data.images || [];
  const hasMoreThanTwo = images.length > 2;

  // If expanded, show all images; otherwise show only first 2
  const visibleImages = isExpanded ? images : images.slice(0, 2);

  return (
    <div className="w-80 md:w-88 bg-card text-foreground rounded-2xl shadow-xl border border-border/60 p-4 transition-all">
      {/* Header: Title + Close Button */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-sm md:text-base text-foreground leading-snug">
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

      {/* Author Row */}
      <div className="flex items-center gap-2 mt-1.5 mb-2.5">
        <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold overflow-hidden">
          {data.author.avatar ? (
            <span>{data.author.avatar}</span>
          ) : (
            data.author.name.charAt(0)
          )}
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          {data.author.name}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3 mb-3">
        {data.description}
      </p>

      {/* Images Grid */}
      {images.length > 0 && (
        <div
          className={`grid grid-cols-2 gap-2 transition-all duration-300 ${
            isExpanded ? "max-h-64 overflow-y-auto pr-1 custom-scrollbar" : ""
          }`}
        >
          {visibleImages.map((imgUrl, idx) => {
            const isSecondImage = idx === 1;
            const remainingCount = images.length - 2;
            const showOverlay = !isExpanded && isSecondImage && hasMoreThanTwo;

            return (
              <div
                key={idx}
                onClick={() => {
                  if (showOverlay) setIsExpanded(true);
                }}
                className={`aspect-[4/5] rounded-xl overflow-hidden bg-muted relative group ${
                  showOverlay ? "cursor-pointer" : ""
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`spot-img-${idx}`}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                />

                {/* +N More Overlay on 2nd photo when collapsed */}
                {showOverlay && (
                  <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] flex flex-col items-center justify-center text-white transition-opacity hover:bg-black/65">
                    <span className="text-base font-bold">+{remainingCount}</span>
                    <span className="text-[10px] uppercase font-medium tracking-wider">
                      More
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Collapse / Expand Toggle Button (if more than 2 photos) */}
      {hasMoreThanTwo && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-muted/50 hover:bg-muted text-xs font-medium text-foreground/80 hover:text-foreground transition-all cursor-pointer"
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
