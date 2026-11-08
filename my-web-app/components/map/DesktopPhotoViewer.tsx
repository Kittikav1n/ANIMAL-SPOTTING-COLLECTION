"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface DesktopPhotoViewerProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
}

export default function DesktopPhotoViewer({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  onIndexChange,
}: DesktopPhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  if (!isOpen || images.length === 0) return null;

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
    onIndexChange?.(index);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    goToIndex(nextIdx);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    goToIndex(nextIdx);
  };

  return (
    <div className="hidden md:flex w-full h-full bg-neutral-900/90 backdrop-blur-xl text-white rounded-3xl shadow-2xl overflow-hidden relative flex-col justify-between p-5 animate-in fade-in zoom-in-95 duration-200 border border-white/10">
      {/* Top Header: Badge indicator + Close Button 'X' */}
      <div className="flex items-center justify-between z-20">
        <span className="text-xs text-white/70 font-medium px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm">
          {currentIndex + 1} of {images.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Main Image Stage - Balanced and Framed with Subtle Shadow */}
      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden my-2">
        <img
          src={images[currentIndex] || images[0]}
          alt={`Photo ${currentIndex + 1}`}
          className="w-full h-full object-contain rounded-2xl shadow-xl select-none"
        />

        {/* Left Arrow */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 size-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 backdrop-blur-sm"
            aria-label="Previous"
          >
            <ChevronLeft className="size-6" />
          </button>
        )}

        {/* Right Arrow */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 size-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 backdrop-blur-sm"
            aria-label="Next"
          >
            <ChevronRight className="size-6" />
          </button>
        )}
      </div>

      {/* Bottom Pagination Dots */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-1 z-20">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex ? "w-6 bg-white" : "w-2 bg-white/35 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
