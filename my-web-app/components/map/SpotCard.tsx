"use client";

import { useState } from "react";
import { X, ChevronDown, MapPin } from "lucide-react";
import AnimalIcon from "@/components/spotModal/AnimalIcon";

export interface SpotCardData {
  id?: string | number;
  title: string;
  address?: string;
  description: string;
  category: string | string[];
  pinName?: string;
  images: string[];
  author: {
    name: string;
    avatar?: string;
  };
}

interface SpotCardProps {
  data: SpotCardData;
  animalPinMap?: Record<string, string>;
  onClose?: () => void;
  onPhotoClick?: (imgUrl: string, index: number) => void;
  activePhotoIndex?: number;
}

export default function SpotCard({
  data,
  animalPinMap,
  onClose,
  onPhotoClick,
  activePhotoIndex,
}: SpotCardProps) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  if (!data) return null;

  const images = data.images || [];
  const hasMoreThanTwo = images.length > 2;
  const displayedImages = showAllPhotos ? images : images.slice(0, 2);
  const categories = Array.isArray(data.category)
    ? data.category
    : data.category
    ? [data.category]
    : [];

  return (
    <div className="w-[360px] max-w-full max-h-[calc(100vh-112px)] bg-card rounded-3xl shadow-xl border border-border p-5 flex flex-col gap-3 text-foreground overflow-hidden">
      {/* Header Row: Title + Close Button */}
      <div className="flex items-start justify-between gap-2 shrink-0">
        <h2 className="text-lg font-bold tracking-tight text-foreground leading-snug line-clamp-2">
          {data.title}
        </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1 -mt-0.5 rounded-full hover:bg-muted shrink-0 cursor-pointer"
            aria-label="Close card"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Full-width Top Border Row: Author (Left) + Animal Badges (Right) */}
      <div className="w-full pt-2.5 border-t border-border/60 flex items-center justify-between gap-2 shrink-0">
        {/* Left: Author */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-7 rounded-full bg-accent text-secondary flex items-center justify-center text-xs font-semibold border border-border/80 shrink-0 overflow-hidden uppercase">
            {data.author?.avatar ? (
              <img
                src={data.author.avatar}
                alt={data.author.name || "author"}
                className="size-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerText = (
                      data.author?.name?.charAt(0) || "A"
                    ).toUpperCase();
                  }
                }}
              />
            ) : (
              (data.author?.name?.charAt(0) || "A").toUpperCase()
            )}
          </div>
          <span className="text-xs font-semibold text-foreground truncate">
            {data.author?.name || "Spotter"}
          </span>
        </div>

        {/* Right: Animal Badge Tags (Truncated +N) */}
        {categories.length > 0 && (
          <div className="flex items-center justify-end gap-1.5 min-w-0 shrink-0">
            {categories.slice(0, 2).map((animalName) => {
              const key = animalName.trim().toLowerCase();
              const pin =
                animalPinMap?.[key] || data.pinName || "ph:paw-print-fill";
              return (
                <span
                  key={animalName}
                  title={animalName}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground text-[11px] font-semibold uppercase tracking-wide max-w-[95px]"
                >
                  <AnimalIcon pinName={pin} className="size-3.5 shrink-0" />
                  <span className="truncate">{animalName}</span>
                </span>
              );
            })}

            {categories.length > 2 && (
              <span
                title={categories.slice(2).join(", ")}
                className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-semibold shrink-0"
              >
                +{categories.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Location */}
      {data.address && (
        <div
          className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0 shrink-0"
          title={data.address}
        >
          <MapPin className="size-3.5 shrink-0 text-primary" />
          <span className="truncate">{data.address}</span>
        </div>
      )}

      {/* Scrollable Content Area (Description + Photo Grid) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-0.5 min-h-0">
        {data.description && (
          <p className="text-sm font-medium text-muted-foreground leading-relaxed shrink-0">
            {data.description}
          </p>
        )}

        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 pt-0.5">
            {displayedImages.map((imgUrl, idx) => {
              const isSecondAndCollapsed =
                !showAllPhotos && hasMoreThanTwo && idx === 1;
              const remainingCount = images.length - 2;
              const isSelected = activePhotoIndex === idx;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (isSecondAndCollapsed) {
                      setShowAllPhotos(true);
                    } else {
                      onPhotoClick?.(imgUrl, idx);
                    }
                  }}
                  className={`aspect-[3/4] rounded-2xl overflow-hidden bg-muted relative group cursor-pointer shadow-sm transition-all ${
                    isSelected ? "ring-2 ring-accent ring-offset-2" : ""
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${data.title} - ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {isSecondAndCollapsed && (
                    <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] flex flex-col items-center justify-center text-white font-semibold transition-opacity group-hover:bg-black/65">
                      <span className="text-base font-bold">
                        +{remainingCount}
                      </span>
                      <span className="text-xs">More</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View all / Show less button */}
      {hasMoreThanTwo && (
        <button
          type="button"
          onClick={() => setShowAllPhotos((prev) => !prev)}
          className="w-full py-2.5 rounded-full bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold flex items-center justify-center gap-1 transition-colors shrink-0 cursor-pointer"
        >
          <span>
            {showAllPhotos ? "Show less" : `View all ${images.length} photos`}
          </span>
          <ChevronDown
            className={`size-4 transition-transform duration-200 ${
              showAllPhotos ? "rotate-180" : ""
            }`}
          />
        </button>
      )}
    </div>
  );
}