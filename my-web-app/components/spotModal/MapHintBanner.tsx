"use client";

import { useState, useEffect } from "react";
import { Lightbulb, X } from "lucide-react";

const STORAGE_KEY = "has_seen_map_hint";
const FADE_MS = 300;

export default function MapHintBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // ปิดเมื่อกดกากบาทเท่านั้น แล้วจำค่าไว้
  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
    setTimeout(() => setMounted(false), FADE_MS);
  };

  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(STORAGE_KEY) === "true";
    } catch {}
    if (seen) return;

    setMounted(true);
    const showTimer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(showTimer);
  }, []);

  if (!mounted) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        pointer-events-none absolute inset-x-0 top-20 z-[1000]
        flex justify-center px-4
        transition-all duration-300 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
      `}
    >
      <div className="pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border border-black/5 bg-white/95 py-2.5 pl-3 pr-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500">
          <Lightbulb className="h-4 w-4" strokeWidth={2.2} />
        </span>

        <p className="text-sm leading-snug text-neutral-600">
          <span className="font-semibold text-neutral-900">Tip</span>
          <span className="mx-1.5 text-neutral-300">|</span>
          ดับเบิลคลิกบนแผนที่เพื่อเพิ่ม Spot ใหม่
        </p>

        <button
          onClick={dismiss}
          aria-label="ปิดคำแนะนำ"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}