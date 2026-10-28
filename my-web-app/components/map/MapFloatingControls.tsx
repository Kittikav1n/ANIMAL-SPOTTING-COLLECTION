"use client";

import { Plus, Minus } from "lucide-react";

interface MapFloatingControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

export default function MapFloatingControls({
  onZoomIn,
  onZoomOut,
}: MapFloatingControlsProps) {
  return (
    <div className="flex flex-col rounded-xl bg-card border border-border shadow-md overflow-hidden">
      <button
        type="button"
        onClick={onZoomIn}
        className="size-9 flex items-center justify-center text-foreground hover:bg-muted/40 transition-colors border-b border-border/60 cursor-pointer"
        title="Zoom In"
      >
        <Plus className="size-4 stroke-[2.5]" />
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        className="size-9 flex items-center justify-center text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
        title="Zoom Out"
      >
        <Minus className="size-4 stroke-[2.5]" />
      </button>
    </div>
  );
}
