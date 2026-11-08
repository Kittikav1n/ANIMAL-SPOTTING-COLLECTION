"use client";

interface AnimalFilterChipsProps {
  items?: string[];
  activeItem?: string;
  onSelect?: (item: string) => void;
}

export default function AnimalFilterChips({
  items = ["ALL", "🐱 CAT", "🐶 DOG", "🐦 BIRD"],
  activeItem = "ALL",
  onSelect,
}: AnimalFilterChipsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      {items.map((item) => {
        const isActive = activeItem === item;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onSelect?.(item)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm border shrink-0 ${
              isActive
                ? "bg-card text-foreground border-foreground/30 font-semibold shadow border-primary"
                : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/40 hover:shadow-sm"
            }`}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}
