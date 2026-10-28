"use client";

import { X } from "lucide-react";

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
  title: "แมวเป้ากินผลไม้",
  author: {
    name: "Kingkong1212",
    avatar: "🐱",
  },
  description:
    "แมวที่มีนิสัยแปลก ๆ ใส่หมวกแอปเปิ้ลไว้บนหัวน่ารักจัง Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  images: [
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop",
  ],
};

export default function SpotCard({
  data = DEFAULT_SPOT,
  onClose,
}: SpotCardProps) {
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
          className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors -mr-1 -mt-1"
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
      {data.images && data.images.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {data.images.slice(0, 2).map((imgUrl, idx) => (
            <div
              key={idx}
              className="aspect-[4/5] rounded-xl overflow-hidden bg-gradient-to-b from-purple-500/80 to-indigo-600/90 relative"
            >
              {imgUrl.startsWith("http") ? (
                <img
                  src={imgUrl}
                  alt={`spot-img-${idx}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-purple-600 to-indigo-800" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
