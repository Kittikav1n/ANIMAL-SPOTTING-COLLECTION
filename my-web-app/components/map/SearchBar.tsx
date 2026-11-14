"use client";

import { useState, useRef, useEffect } from "react";
import { Filter, Search, Clock, X, MapPin, Loader2 } from "lucide-react";
import AnimalFilterChips, { AnimalChipItem } from "./AnimalFilterChips";

export interface LocationSearchResult {
  name: string;
  lat: number;
  lng: number;
}

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSelectLocation?: (location: LocationSearchResult) => void;
  placeholder?: string;
  animalItems?: AnimalChipItem[];
  activeAnimal?: string;
  onSelectAnimal?: (animal: string) => void;
  onFilterClick?: () => void;
  recentSearches?: LocationSearchResult[];
}

const STORAGE_KEY = "animal_spotting_recent_locations_v2";

export default function SearchBar({
  value = "",
  onChange,
  onSelectLocation,
  placeholder = "Search area",
  animalItems,
  activeAnimal = "ALL",
  onSelectAnimal,
  onFilterClick,
  recentSearches: propRecentSearches,
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<LocationSearchResult[]>(
    propRecentSearches || []
  );
  const [suggestions, setSuggestions] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // โหลดประวัติสถานที่ที่เคยค้นหาจาก LocalStorage
  useEffect(() => {
    if (propRecentSearches) {
      setRecentSearches(propRecentSearches);
      return;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setRecentSearches(parsed);
      }
    } catch {
      // ignore
    }
  }, [propRecentSearches]);

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

  // ค้นหาสถานที่ผ่าน OpenStreetMap Nominatim API (Debounce 400ms)
  useEffect(() => {
    const query = value.trim();
    if (!query) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // เน้นค้นหาในประเทศไทย (countrycodes=th) และจำกัด 5 รายการ
        // const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        //   query
        // )}&countrycodes=th&limit=5&accept-language=th,en`;

        // ค้นรอบๆในมอ
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=th&viewbox=100.487,13.657,100.498,13.646&bounded=1&limit=5&accept-language=th,en`;

        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();

        if (Array.isArray(data)) {
          const mapped: LocationSearchResult[] = data.map((item: any) => ({
            name: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          }));
          setSuggestions(mapped);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Nominatim search error:", err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  const saveRecentSearches = (items: LocationSearchResult[]) => {
    setRecentSearches(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  const handleRemoveRecent = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s.name !== name);
    saveRecentSearches(updated);
  };

  const handleSelectLocation = (loc: LocationSearchResult) => {
    // ตัดชื่อให้สั้นลงสำหรับแสดงในช่อง Input (เอาเฉพาะ 2 ส่วนแรก)
    const shortName = loc.name.split(",").slice(0, 2).join(",").trim();
    const cleanLoc = { ...loc, name: shortName };

    onChange?.(shortName);
    onSelectLocation?.(cleanLoc);
    setIsOpen(false);

    // บันทึกลง Recent Searches
    const updated = [
      cleanLoc,
      ...recentSearches.filter((s) => s.name !== shortName),
    ].slice(0, 6);
    saveRecentSearches(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      // ถ้ามีผลลัพธ์จาก Nominatim ให้เลือกตัวแรกทันที
      if (suggestions.length > 0) {
        handleSelectLocation(suggestions[0]);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full md:w-80 z-30">
      {/* Search Input Box */}
      <div
        className={`flex items-center bg-card border border-border px-4 py-2.5 gap-3 shadow-md ${
          isOpen
            ? "rounded-t-2xl rounded-b-none border-b-border/40"
            : "rounded-full"
        }`}
      >
        {/* Mobile Filter Button */}
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

        {/* Input */}
        <input
          type="text"
          value={value}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            onChange?.(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm font-light text-foreground placeholder:font-light placeholder:text-muted-foreground/60 outline-none min-w-0"
        />

        {/* Clear button หรือ Search / Loading Icon */}
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange?.("");
              setSuggestions([]);
            }}
            className="text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
          >
            <X className="size-4" />
          </button>
        ) : isSearching ? (
          <Loader2 className="size-4 text-primary animate-spin shrink-0" />
        ) : (
          <Search className="size-4 text-primary shrink-0 hidden md:block" />
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-card border border-t-0 border-border rounded-b-2xl shadow-xl z-50 overflow-hidden p-3 flex flex-col gap-3">
          {/* Mobile Quick Filter Chips */}
          <div className="w-full overflow-x-auto no-scrollbar md:hidden">
            <AnimalFilterChips
              items={animalItems}
              activeItem={activeAnimal}
              onSelect={(animal) => onSelectAnimal?.(animal)}
            />
          </div>

          {/* 1. ผลการค้นหาสถานที่จาก OpenStreetMap */}
          {value.trim().length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground px-2 pt-1">
                {isSearching ? "Searching places..." : "Locations"}
              </span>

              {!isSearching && suggestions.length === 0 ? (
                <div className="px-2 py-3 text-xs text-muted-foreground text-center">
                  No places found
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border/40">
                  {suggestions.map((loc, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectLocation(loc)}
                      className="flex items-start gap-2.5 px-2 py-2.5 hover:bg-muted/50 rounded-xl cursor-pointer group"
                    >
                      <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-foreground/90 line-clamp-2 font-light group-hover:text-foreground">
                        {loc.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. ประวัติการค้นหาล่าสุด (แสดงเมื่อยังไม่ได้พิมพ์ค้นหา) */}
          {!value.trim() && recentSearches.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground px-2 pt-1">
                Recent
              </span>

              <div className="flex flex-col divide-y divide-border/40">
                {recentSearches.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectLocation(item)}
                    className="flex items-center justify-between px-2 py-2.5 hover:bg-muted/50 rounded-xl cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Clock className="size-3.5 text-muted-foreground shrink-0 group-hover:text-foreground" />
                      <span className="text-xs sm:text-sm text-foreground/90 truncate font-light group-hover:text-foreground">
                        {item.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveRecent(e, item.name)}
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