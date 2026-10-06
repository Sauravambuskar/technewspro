"use client";

import { useRef } from "react";
import type { ReactNode } from "react";

export default function CategorySlider({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const move = (direction: number) => trackRef.current?.scrollBy({ left: direction * trackRef.current.clientWidth * 0.82, behavior: "smooth" });

  return (
    <div className="category-slider">
      <div className="category-slider-controls" aria-label="Featured categories controls">
        <button type="button" onClick={() => move(-1)} aria-label="Previous categories">←</button>
        <button type="button" onClick={() => move(1)} aria-label="Next categories">→</button>
      </div>
      <div className="category-grid" ref={trackRef}>{children}</div>
    </div>
  );
}
