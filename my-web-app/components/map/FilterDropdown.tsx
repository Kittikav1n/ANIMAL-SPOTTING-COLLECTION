"use client";

import { ChevronDown } from "lucide-react";

interface FilterDropdownProps {
  label?: string;
  onClick?: () => void;
}

export default function FilterDropdown({
  label = "Filter by Animal",
  onClick,
}: FilterDropdownProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 bg-card text-foreground px-4 py-2 rounded-full border border-border shadow-sm text-xs md:text-sm font-medium hover:bg-muted/40 transition-colors"
    >
      <span>{label}</span>
      <ChevronDown className="size-4 text-muted-foreground" />
    </button>
  );
}
