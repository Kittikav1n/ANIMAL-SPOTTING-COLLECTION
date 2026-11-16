"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

interface SpotPhotoViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
}

export default function SpotPhotoViewerModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}: SpotPhotoViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  if (!isOpen || images.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 animate-in fade-in duration-200">
      {/* Top Header: Back Button */}
      <div className="flex items-center justify-between z-10 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </button>
        <span className="text-white/70 text-xs font-medium px-2.5 py-1 rounded-full bg-white/10">
          {currentIndex + 1} / {images.length}
        </span>
      </div>

      {/* Main Photo Center */}
      <div className="relative flex-1 min-h-0 min-w-0 w-full flex items-center justify-center overflow-hidden my-3">
        <img
          src={images[currentIndex]}
          alt={`Photo ${currentIndex + 1}`}
          className="max-h-full max-w-full w-auto h-auto object-contain rounded-2xl shadow-lg select-none"
        />

        {/* Previous / Next arrows if multiple images */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 size-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 size-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {/* Bottom Pagination Dots */}
      {images.length > 1 ? (
        <div className="flex items-center justify-center gap-2 pb-4 z-10 shrink-0">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex ? "w-6 bg-white" : "w-2 bg-white/40"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      ) : (
        <div className="h-4 shrink-0" />
      )}
    </div>
  );
}