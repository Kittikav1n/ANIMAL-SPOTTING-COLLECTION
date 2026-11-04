"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Clock, X } from "lucide-react";

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSelectArea?: (area: string) => void;
  placeholder?: string;
}

// !mock ต้องเอามาจาก database แต่ละ user
const DEFAULT_RECENT_SEARCHES = [
  "Krung Thep Maha Nakhon",
  "KMUTT Bangmod Campus",
  "Thung Khru, Bangkok",
  "Pracha Uthit Road",
];

export default function SearchBar({
  value = "",
  onChange,
  onSelectArea,
  placeholder = "Search area",
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(
    DEFAULT_RECENT_SEARCHES
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRemoveItem = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => prev.filter((s) => s !== item));
  };

  const handleSelectItem = (item: string) => {
    onChange?.(item);
    onSelectArea?.(item);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-64 sm:w-72 md:w-80 z-30">
      {/* Search Input Box */}
      <div
        className={`flex items-center bg-card shadow-md border border-border px-4 py-2.5 ${
          isOpen && recentSearches.length > 0
            ? "rounded-t-2xl border-b-border/40"
            : "rounded-full"
        }`}
      >
        <input
          type="text"
          value={value}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange?.(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-normal"
        />
        <Search className="size-4 text-primary shrink-0 cursor-pointer"/>
      </div>

      {/* Dropdown Suggestions List */}
      {isOpen && recentSearches.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-card rounded-b-2xl shadow-xl border border-t-0 border-border">
          <div className="flex flex-col divide-y divide-border/60">
            {recentSearches.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectItem(item)}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Clock className="size-3.5 text-muted-foreground shrink-0 group-hover:text-foreground" />
                  <span className="text-xs sm:text-sm text-foreground/90 truncate font-normal group-hover:text-foreground">
                    {item}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleRemoveItem(e, item)}
                  className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors cursor-pointer"
                  aria-label="Remove search"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
