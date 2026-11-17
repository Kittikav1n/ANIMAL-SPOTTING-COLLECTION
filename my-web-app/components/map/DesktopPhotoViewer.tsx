"use client";

import React, { useEffect } from "react";
import { Icon } from "@iconify/react";

interface DesktopPhotoViewerProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex: number;
  onIndexChange: (index: number) => void;
}

export default function DesktopPhotoViewer({
  isOpen,
  onClose,
  images,
  initialIndex,
  onIndexChange,
}: DesktopPhotoViewerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        onIndexChange((initialIndex + 1) % images.length);
      }
      if (e.key === "ArrowLeft") {
        onIndexChange((initialIndex - 1 + images.length) % images.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, initialIndex, images.length, onClose, onIndexChange]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 md:p-10 animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* ปุ่มปิดมุมขวาบน */}
      <button
        onClick={onClose}
        aria-label="Close photo viewer"
        className="absolute top-4 right-4 z-[10000] flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 transition"
      >
        <Icon icon="ph:x-bold" className="w-5 h-5" />
      </button>

      {/* ตัวนับจำนวนรูป */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3.5 py-1 text-xs font-medium text-white">
        {initialIndex + 1} / {images.length}
      </div>

      {/* ปุ่มเลื่อนซ้าย */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onIndexChange((initialIndex - 1 + images.length) % images.length);
          }}
          className="absolute left-3 md:left-6 z-[10000] flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 transition"
        >
          <Icon icon="ph:caret-left-bold" className="w-6 h-6" />
        </button>
      )}

      {/* รูปภาพเต็มหน้าจอ */}
      <div
        className="relative flex max-h-[88vh] max-w-[92vw] items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[initialIndex]}
          alt={`Spot photo ${initialIndex + 1}`}
          className="max-h-[88vh] max-w-[92vw] rounded-xl object-contain shadow-2xl select-none"
        />
      </div>

      {/* ปุ่มเลื่อนขวา */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onIndexChange((initialIndex + 1) % images.length);
          }}
          className="absolute right-3 md:right-6 z-[10000] flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 transition"
        >
          <Icon icon="ph:caret-right-bold" className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}