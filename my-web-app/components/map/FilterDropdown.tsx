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
          ? "bg-card border-secondary/40 text-foreground dark:bg-secondary/25 dark:border-secondary/60 dark:text-secondary-foreground"
          : "bg-card text-foreground border-border hover:border-secondary/40 transition-all dark:bg-secondary/10 dark:text-secondary-foreground dark:border-secondary/40 dark:hover:bg-secondary/20"
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
