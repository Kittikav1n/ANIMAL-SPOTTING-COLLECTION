"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
      if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, images.length, onClose]);

  if (!isOpen || !mounted || images.length === 0) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* ปุ่มปิดมุมขวาบน */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        aria-label="Close photo viewer"
      >
        <X className="size-6" />
      </button>

      {/* ตัวนับจำนวนรูป */}
      {images.length > 1 && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-medium">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* ปุ่มเลื่อนซ้าย */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex((prev) =>
              prev === 0 ? images.length - 1 : prev - 1
            );
          }}
          className="absolute left-4 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          aria-label="Previous photo"
        >
          <ChevronLeft className="size-6" />
        </button>
      )}

      {/* รูปภาพหลัก */}
      <img
        src={images[currentIndex]}
        alt={`Spot photo ${currentIndex + 1}`}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88dvh] max-w-[92vw] object-contain rounded-xl shadow-2xl select-none"
      />

      {/* ปุ่มเลื่อนขวา */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex((prev) =>
              prev === images.length - 1 ? 0 : prev + 1
            );
          }}
          className="absolute right-4 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          aria-label="Next photo"
        >
          <ChevronRight className="size-6" />
        </button>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}