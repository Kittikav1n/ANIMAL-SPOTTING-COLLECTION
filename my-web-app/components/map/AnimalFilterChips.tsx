"use client";

interface AnimalFilterChipsProps {
  items?: string[];
  activeItem?: string;
  onSelect?: (item: string) => void;
}

export default function AnimalFilterChips({
  items = ["All", "Cat", "Dog", "Duck"],
  activeItem = "All",
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
                ? "bg-card text-foreground border-foreground/30 font-semibold shadow"
                : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/20"
            }`}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}
