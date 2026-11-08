"use client";

import { ChevronDown } from "lucide-react";

interface FilterDropdownProps {
  label?: string;
  onClick?: () => void;
  selectedCount?: number;
}

export default function FilterDropdown({
  label = "Filter by Animal",
  onClick,
  selectedCount = 0,
}: FilterDropdownProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm text-xs md:text-sm font-medium transition-all cursor-pointer  ${
        selectedCount > 0
          ? "bg-secondary/15 border-secondary/40 text-secondary dark:bg-secondary/25 dark:border-secondary/60 dark:text-secondary-foreground"
          : "bg-card text-foreground border-border hover:bg-card/90"
      }`}
    >
      <span>{label}</span>
      {selectedCount > 0 && (
        <span className="size-5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold flex items-center justify-center">
          {selectedCount}
        </span>
      )}
      <ChevronDown className="size-4 text-muted-foreground" />
    </button>
  );
}
