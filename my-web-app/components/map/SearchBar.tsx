"use client";

import { useState, useRef, useEffect } from "react";
import { Filter, Search, Clock, X } from "lucide-react";
import AnimalFilterChips from "./AnimalFilterChips";

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSelectArea?: (area: string) => void;
  placeholder?: string;
  activeAnimal?: string;
  onSelectAnimal?: (animal: string) => void;
  onFilterClick?: () => void;
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
  activeAnimal = "ALL",
  onSelectAnimal,
  onFilterClick,
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(
    DEFAULT_RECENT_SEARCHES
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // ปิด Dropdown เมื่อคลิกนอกพื้นที่
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
    <div ref={containerRef} className="relative w-full md:w-80 z-30">
      {/* Search Input Box - ติดชิดกับ Dropdown เมื่อกดเปิด */}
      <div
        className={`flex items-center bg-card border border-border px-4 py-2.5 gap-3 shadow-md ${
          isOpen
            ? "rounded-t-2xl rounded-b-none border-b-border/40"
            : "rounded-full"
        }`}
      >
        {/* ไอคอน Filter (แสดงเฉพาะบนมือถือ md:hidden) */}
        <div className="flex items-center gap-2.5 shrink-0 md:hidden">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFilterClick?.();
            }}
            className="text-[#c85a42] hover:opacity-80 cursor-pointer flex items-center justify-center"
            aria-label="Filter"
          >
            <Filter className="size-4 stroke-[2.2]" />
          </button>
          <div className="h-4 w-[1px] bg-border" />
        </div>

        {/* ช่องพิมพ์ข้อความ */}
        <input
          type="text"
          value={value}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange?.(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm font-light text-foreground placeholder:font-light placeholder:text-muted-foreground/60 outline-none"
        />

        {/* ไอคอน Search (แสดงเฉพาะบน PC hidden md:block และซ่อนในมือถือ) */}
        <Search className="size-4 text-primary shrink-0 cursor-pointer hidden md:block" />
      </div>

      {/* Dropdown Menu (ประกบติดขอบล่างของกล่องเสิช ไร้อิเมชั่น) */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-card border border-t-0 border-border rounded-b-2xl shadow-xl z-50 overflow-hidden p-3 flex flex-col gap-3">
          {/* Quick Filter Chips (แสดงเฉพาะบนมือถือ md:hidden) */}
          <div className="w-full overflow-x-auto no-scrollbar md:hidden">
            <AnimalFilterChips
              items={["ALL", "🐱 CAT", "🐶 DOG", "🐦 BIRD"]}
              activeItem={activeAnimal}
              onSelect={(animal) => {
                onSelectAnimal?.(animal);
              }}
            />
          </div>

          {/* รายการ Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground px-2 pt-1">
                Recent
              </span>

              <div className="flex flex-col divide-y divide-border/40">
                {recentSearches.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectItem(item)}
                    className="flex items-center justify-between px-2 py-2.5 hover:bg-muted/50 rounded-xl cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Clock className="size-3.5 text-muted-foreground shrink-0 group-hover:text-foreground" />
                      <span className="text-xs sm:text-sm text-foreground/90 truncate font-light group-hover:text-foreground">
                        {item}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveItem(e, item)}
                      className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted cursor-pointer"
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
      )}
    </div>
  );
}