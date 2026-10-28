"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value = "",
  onChange,
  placeholder = "Search area",
}: SearchBarProps) {
  return (
    <div className="relative flex items-center bg-card rounded-full shadow-sm border border-border px-4 py-2 gap-2 w-56 md:w-64">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-xs md:text-sm text-foreground placeholder:text-muted-foreground outline-none"
      />
      <Search className="size-4 text-primary shrink-0 cursor-pointer" />
    </div>
  );
}
