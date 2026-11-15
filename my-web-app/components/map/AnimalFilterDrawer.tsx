"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Check, X } from "lucide-react";
import AnimalIcon from "../spotModal/AnimalIcon";

export interface AnimalCategoryOption {
  id: string;
  name: string;
  avatar?: string;
  pinName?: string;
  icon?: string;
}

interface AnimalFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategories: string[];
  onChange: (selected: string[]) => void;
  options?: AnimalCategoryOption[];
}

export default function AnimalFilterDrawer({
  isOpen,
  onClose,
  selectedCategories,
  onChange,
  options = [],
}: AnimalFilterDrawerProps) {
  const [search, setSearch] = useState("");
  const [mobileHeight, setMobileHeight] = useState<"half" | "full">("half");

  useEffect(() => {
    if (isOpen) {
      setMobileHeight("half");
    }
  }, [isOpen]);

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
    const diff = touchStartY.current - touchCurrentY.current;
    const threshold = 40;

    if (diff > threshold) {
      setMobileHeight("full");
    } else if (diff < -threshold) {
      if (mobileHeight === "full") {
        setMobileHeight("half");
      } else {
        onClose();
      }
    }

    touchStartY.current = null;
    touchCurrentY.current = null;
  };

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    return options.filter((opt) =>
      opt.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, options]);

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
          `left-0 right-0 bottom-0 rounded-t-3xl p-3 md:left-auto md:bottom-auto ${
            mobileHeight === "half" ? "h-[54vh]" : "h-[86vh]"
          } ` +
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

        {/* Header */}
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

        {/* Search input */}
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
            {selectedCategories.length} / {options.length}
          </span>
        </div>

        {/* List of Animals */}
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border/40 pr-1 min-h-0">
          {filteredOptions.length === 0 ? (
            <div className="flex items-center justify-center h-full text-xs text-muted-foreground py-8">
              No animals found
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = selectedCategories.includes(opt.id);
              const iconCode = opt.pinName || opt.icon || opt.avatar || "";

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
                  {/* Animal Iconify icon + Name */}
                  <div className="flex items-center gap-2.5">
                    <div className="size-7.5 rounded-full bg-accent text-secondary flex items-center justify-center shrink-0">
                      <AnimalIcon pinName={iconCode} className="w-4 h-4 text-current" />
                    </div>
                    <span className="font-bold text-xs tracking-wider uppercase">
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
            })
          )}
        </div>
      </div>
    </>
  );
}