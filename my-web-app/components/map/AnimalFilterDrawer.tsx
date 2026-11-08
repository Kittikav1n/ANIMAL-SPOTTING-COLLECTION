"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Check, X } from "lucide-react";

export interface AnimalCategoryOption {
  id: string;
  name: string;
  avatar: string;
}

export const ANIMAL_OPTIONS: AnimalCategoryOption[] = [
  { id: "dog", name: "DOG", avatar: "🐶" },
  { id: "cat", name: "CAT", avatar: "🐱" },
  { id: "bird", name: "BIRD", avatar: "🐦" },
  { id: "eagle", name: "EAGLE", avatar: "🦅" },
  { id: "salmon", name: "SALMON", avatar: "🐟" },
  { id: "frog", name: "FROG", avatar: "🐸" },
  { id: "snake", name: "SNAKE", avatar: "🐍" },
  { id: "butterfly", name: "BUTTERFLY", avatar: "🦋" },
  { id: "elephant", name: "ELEPHANT", avatar: "🐘" },
  { id: "giraffe", name: "GIRAFFE", avatar: "🦒" },
  { id: "dolphin", name: "DOLPHIN", avatar: "🐬" },
];

interface AnimalFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategories: string[];
  onChange: (selected: string[]) => void;
}

export default function AnimalFilterDrawer({
  isOpen,
  onClose,
  selectedCategories,
  onChange,
}: AnimalFilterDrawerProps) {
  const [search, setSearch] = useState("");

  // Mobile Drawer Drag / Expansion State
  // "collapsed" = 50vh, "full" = 85vh
  const [mobileHeight, setMobileHeight] = useState<"half" | "full">("half");

  // Reset to half height when opened
  useEffect(() => {
    if (isOpen) {
      setMobileHeight("half");
    }
  }, [isOpen]);

  // Touch drag swipe gestures on mobile
  const touchStartY = useRef<number | null>(null);
  const touchCurrentY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (touchStartY.current === null || touchCurrentY.current === null) return;
    const diff = touchStartY.current - touchCurrentY.current; // >0 is swipe up, <0 is swipe down
    const threshold = 40;

    if (diff > threshold) {
      // Swipe up -> expand to full
      setMobileHeight("full");
    } else if (diff < -threshold) {
      // Swipe down
      if (mobileHeight === "full") {
        setMobileHeight("half");
      } else {
        // Swipe down on half -> close drawer
        onClose();
      }
    }

    touchStartY.current = null;
    touchCurrentY.current = null;
  };

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return ANIMAL_OPTIONS;
    return ANIMAL_OPTIONS.filter((opt) =>
      opt.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  if (!isOpen) return null;

  const toggleCategory = (id: string) => {
    if (selectedCategories.includes(id)) {
      onChange(selectedCategories.filter((c) => c !== id));
    } else {
      onChange([...selectedCategories, id]);
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 md:hidden animate-in fade-in duration-200"
      />

      {/* Filter Panel */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`fixed z-50 bg-card text-foreground shadow-2xl border border-border transition-all duration-300 ease-out flex flex-col ${
          /* Mobile styles: Bottom sheet with drag gestures */
          `left-0 right-0 bottom-0 rounded-t-3xl p-3 md:left-auto md:bottom-auto ${
            mobileHeight === "half" ? "h-[54vh]" : "h-[86vh]"
          } ` +
          /* Desktop styles: Shorter and compact (h-[420px], w-[330px]) */
          "md:top-20 md:right-4 md:w-[330px] md:h-[420px] md:rounded-3xl animate-in fade-in zoom-in-95"
        }`}
      >
        {/* Mobile drag handle button */}
        <button
          type="button"
          onClick={() =>
            setMobileHeight((prev) => (prev === "half" ? "full" : "half"))
          }
          className="w-full flex justify-center py-1 -mt-1 mb-2 md:hidden cursor-pointer"
          aria-label="Toggle height"
        >
          <div className="w-12 h-1 bg-muted-foreground/30 hover:bg-muted-foreground/50 rounded-full transition-colors" />
        </button>

        {/* Header: Title + Done Button */}
        <div className="flex items-center justify-between pb-2.5 border-b border-border/60 shrink-0">
          <h3 className="font-bold text-sm md:text-base text-foreground">
            Filter by Animal
          </h3>
          <div className="flex items-center gap-2">
            {selectedCategories.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-muted-foreground hover:text-foreground font-medium px-2 py-1 rounded transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-secondary-foreground bg-secondary hover:bg-secondary/90 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer shadow-xs"
            >
              Done
            </button>
          </div>
        </div>

        {/* Search input in Drawer */}
        <div className="my-2.5 relative shrink-0">
          <div className="flex items-center bg-muted/60 rounded-xl px-5 py-2 gap-2 border border-border/50">
            <Search className="size-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ex. Dog, Cat"
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Selected count info row */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1 pb-1 shrink-0">
          <span>Selected</span>
          <span className="font-medium text-foreground">
            {selectedCategories.length} / {ANIMAL_OPTIONS.length}
          </span>
        </div>

        {/* List of Animals with Checkbox & Avatar */}
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border/40 pr-1 min-h-0">
          {filteredOptions.map((opt) => {
            const isSelected = selectedCategories.includes(opt.id);

            return (
              <div
                key={opt.id}
                onClick={() => toggleCategory(opt.id)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors select-none ${
                  isSelected
                    ? "bg-secondary/10 dark:bg-secondary/20 text-foreground"
                    : "hover:bg-muted/40 text-foreground/90"
                }`}
              >
                {/* Animal avatar icon + Name */}
                <div className="flex items-center gap-2.5">
                  <div className="size-7.5 rounded-full bg-[#E0ECDD] border border-[#536E50]/40 text-secondary flex items-center justify-center text-xs shadow-2xs shrink-0">
                    {opt.avatar}
                  </div>
                  <span className="font-bold text-xs tracking-wider">
                    {opt.name}
                  </span>
                </div>

                {/* Checkbox */}
                <div
                  className={`size-4.5 rounded flex items-center justify-center border transition-all ${
                    isSelected
                      ? "bg-secondary border-secondary text-secondary-foreground shadow-xs"
                      : "border-muted-foreground/40 bg-card hover:border-muted-foreground"
                  }`}
                >
                  {isSelected && <Check className="size-3 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
