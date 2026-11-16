"use client";

import AnimalIcon from "../spotModal/AnimalIcon";

export interface AnimalChipItem {
  id: string;
  label: string;
  pinName?: string;
}

interface AnimalFilterChipsProps {
  items?: (AnimalChipItem | string)[];
  activeItem?: string;
  onSelect?: (id: string) => void;
}

export default function AnimalFilterChips({
  items = [{ id: "ALL", label: "ALL" }],
  activeItem = "ALL",
  onSelect,
}: AnimalFilterChipsProps) {
  const currentActive = activeItem || "ALL";

  const handleSelect = (id: string) => {
    if (id === "ALL") {
      onSelect?.("ALL");
      return;
    }
    onSelect?.(currentActive === id ? "ALL" : id);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      {items.map((rawItem) => {
        const item: AnimalChipItem =
          typeof rawItem === "string"
            ? { id: rawItem, label: rawItem }
            : rawItem;

        const isActive = currentActive === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSelect(item.id)}
            className={`flex items-center gap-2 h-8 rounded-full text-xs font-medium transition-all shadow-sm border shrink-0 cursor-pointer ${
              item.pinName ? "pl-1.5 pr-3.5 py-1" : "px-4 py-1.5"
            } ${
              isActive
                ? "bg-card text-foreground border-primary font-semibold shadow ring-1 ring-secondary/20"
                : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-secondary/40 hover:shadow-sm"
            }`}
          >
            {item.pinName && (
              <span className="flex items-center justify-center w-6 h-6 rounded-full shrink-0 bg-accent text-secondary">
                <AnimalIcon pinName={item.pinName} className="w-3.5 h-3.5 text-current" />
              </span>
            )}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}